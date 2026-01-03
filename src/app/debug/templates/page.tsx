import { templates } from "@/lib/templates";

export default async function DebugTemplates() {
  const loadedTemplates = await Promise.all(
    Object.entries(templates).map(async ([name, template]) => {
      const content = await template();
      return { name, content: (content as any[])[0] };
    })
  );
  return (
    <div>
      <h1>Debug Templates</h1>
      <p>This is a debug page for templates.</p>
      <ul>
        {loadedTemplates.map(({ name, content }) => (
          <li key={name}>
            <h2>{name}</h2>
            <pre>{JSON.stringify(content, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
