# Tool / Model evaluation

Since early Feburary 2026, most of the development work on this was heavily assisted by GitHub Copilot, first with Claude Sonnet 4.5, then with 4.6 and some occasional experiments with Opus.  In April/May 2026, I also started using certain ideas I had for this project as a testbed for other tools/models - seeing how well they'd handle this kind of scenario, with the hope of informing my choice of tools and models for other work.

This document is a collection of notes from those experiments on a 4080 (16GB VRAM) + 7800X3D (64GB system RAM) windows desktop computer.

| Tool / Model | Duration | LLM calls `*` | Cost `**` |
| --- | --- | --- | --- |
| [PR 7: GHCP-cli Claude Sonnet 4.6](https://github.com/jorupp/terra-invicta-assistant/pull/7) | 40m | 32 | $10.05 |
| [PR 4: OpenCode, llama.cpp, qwen3.6-35b-a3b:i1-Q4_K_S w/ 262k context](https://github.com/jorupp/terra-invicta-assistant/pull/4) | 32m | 61 | $0.053 |
| [PR 6: OpenCode, llama.cpp, qwen3.6-35b-a3b:i1-Q4_K_S w/ 147k context](https://github.com/jorupp/terra-invicta-assistant/pull/6) | 45m | 36 | $0.075 |
| [PR 8: OpenCode, llama.cpp, qwen3.6-35b-a3b:i1-Q4_K_S w/ max context](https://github.com/jorupp/terra-invicta-assistant/pull/8) | 31m | 88 | $0.052 |
| [PR 5: OpenCode, lmstudio, qwen3.6-35b-a3b w/ 128k context](https://github.com/jorupp/terra-invicta-assistant/pull/5) | 5h41m | 100 | $0.568 |
| [PR 9: OpenCode, llama.cpp, granite-4.1-8b:i1-Q4_K_S w/ full context and q4 kv cache](https://github.com/jorupp/terra-invicta-assistant/pull/9) | x | x | x |
| [PR 10: OpenCode, llama.cpp, granite-4.1-8b:i1-Q4_K_S w/ smaller, unquantized context](https://github.com/jorupp/terra-invicta-assistant/pull/10) | x | x | x |

> `*` Call count is from the session logs or GHCP session event log file - it is unclear how trustworthy they are for this number - ie. I'm unsure if this includes sub-agent calls or just calls from the main agent.

> `**` For GHCP-hosted models, costs are projected based on token usage for announced prices that take effect in June 2026.  For local models, costs are estimated based on observed power draw for the system (500W) at a bit over Illinois residential power costs ($0.20/kWh) for the duration of the run.  There is no attempt to account for hardware costs or depreciation in this number.  Models at didn't complete successfully are marked with "x" since it's not clear how to estimate their costs.

## Thoughts

As-expected, GHCP+Sonnet did well.  Not perfect, but a solid start for a single-shot approach.

The LM Studio run with `qwen3.6-35b-a3b` gave good output, but was _much_ too slow to be practical for normal daily use.  It called the LLM 100 times, taking ~100s each time, accounting for almost 3 hours of the runtime. I assume the rest was processing tool calls locally, but I'm not too sure - still not 100% clear on how much to trust the OpenCode exports?  It seems suspicious to have _exactly_ 100 calls to the LLM.  I'm assuming that this performance was because the quant being used wasn't as aggressive as what I was using with llama.cpp, but I didn't explore LM Studio that deeply (though it was _really_ easy to get started with).

The Granite model didn't work well at all - at least with the quant and context size I was using.  Using even a 64k context size seems to require a _lot_ of memory with this model so I had to choose between a full context with Q4 kv cache or a small context that may have been too small to be useful.  And for both, I used an aggresive quant for the model to save some space for context.  I wonder if other context-compression approaches like [FastDMS](https://www.reddit.com/r/LocalLLaMA/comments/1t3vlrx/fastdms_64x_kvcache_compression_running_faster/) might be helpful here to get a usable context window with a smaller memory footprint to allow using a less-quantized model?

`qwen3.6-35b-a3b` in general did a pretty good job re: outputs (both LMStudio and llama.cpp).  It would have to be _really_ aggressively quantized to fully fit in 16GB of VRAM, but since it's a MOE model, it's performance doesn't suffer too terribly when some of the MOE layers have to spill over to CPU memory.  The llama.cpp runs with the `i1-Q4_K_S` quant felt like they were within the same accuracy ballpark as GHCP+Sonnet, and I was surprised to see the ones with the full-size context were actually _faster_ to run than the GHCP-Sonnet one was.

### Security prompts

GHCP did have the standard issue of generating scripts that used calls that require a security prompt by default (eg. write-host, out-null), but OpenCode didn't hit similar issues.  I'm not sure if that's because those models didn't generate calls like that, or because OpenCode's default security-check policy is looser than GHCP's.  Trying GHCP w/ local models would provide more info on this.

## Future exploration

- [FastDMS context compression](https://www.reddit.com/r/LocalLLaMA/comments/1t3vlrx/fastdms_64x_kvcache_compression_running_faster/) - I wonder if this would make models like granite-4.1-8b more viable for a 16GB VRAM setup.
- MTP (multi-token prediction) - haven't explored this at all, but this might make the LLM calls even faster, though not sure if the extra VRAM usage would mean smaller or more-aggressively-quantized models would be needed to make it work.
- [GHCP w/ local models](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models) - I'm curious how this will compare to OpenCode.
- Other models - `quen3.6-27b`, `gpt-oss-20b`
- See if any 5090s have fallen off the back of a truck in my neighborhood
