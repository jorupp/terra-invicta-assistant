/*
 * RenderGameComponent.tsx – React component for a collapsible left navigation tree on the /game/current page.
 * Includes a top-level "Councilors" node with a subtitle, child nodes "Existing Council" and "Find new",
 * and a main content area that updates based on the selected node. Uses React Context for state.
 */

import React, { createContext, useContext, useState } from 'react';
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuTrigger, NavigationMenuLink } from '@headlessui/react';

/* ---------------------- Context Definition ---------------------- */
interface GamePageContextProps {
  selectedItem: string;
  setSelectedItem: (value: string) => void;
}

const GamePageContext = React.createContext<GamePageContextProps>(
  { selectedItem: 'Existing Council', setSelectedItem: (_) => {} }
);

/* ---------------------- Mock Content Components ---------------------- */

const ExistingCouncil = () => {
  return (
    <div className="px-4 py-2 bg-gray-50">
      <h2 className="text-lg font-semibold">Existing Council</h2>
      <p>Details about the existing council...</p>
    </div>
  );
};

const FindNew = () => {
  return (
    <div className="px-4 py-2 bg-gray-50">
      <h2 className="text-lg font-semibold">Find New</h2>
      <p>Find new council members...</p>
    </div>
  );
};

/* ---------------------- Tree Structure Definition ---------------------- */

interface TreeNode {
  id: string;
  label: string;
  subtitle?: string; // optional subtitle for the top-level item
  children?: TreeNode[]; // only top-level can have children
  component: React.FC<any>; // component to render when this node is selected
}

const tree: TreeNode[] = [
  {
    id: 'councilors',
    label: 'Councilors',
    subtitle: 'Score Details',
    children: [
      { id: 'existing-council', label: 'Existing Council', component: ExistingCouncil },
      { id: 'find-new', label: 'Find new', component: FindNew },
    ],
  },
];

/* ---------------------- RenderGameComponent ---------------------- */

export const RenderGameComponent: React.FC = () => {
  const { selectedItem, setSelectedItem } = useContext(GamePageContext);

  // Determine which content component to render based on selectedItem
  const selectedContent = tree.find((node) => node.id === selectedItem)?.children?.find((child) => child.id === selectedItem)?.component;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left navigation pane */}
      <div className="w-64 border-r bg-white p-4">
        <NavigationMenu as="div" className="bg-white shadow-md">
          {tree.map((topItem) => (
            <NavigationMenuTrigger key={topItem.id} className="flex items-center px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none">
              {topItem.label}
              {/* Subtitle displayed under label */}
              {topItem.subtitle && <span className="ml-2 text-sm text-gray-500">{topItem.subtitle}</span>}
            </NavigationMenuTrigger>

            {/* Sub‑menu list */}
            <NavigationMenuList>
              {topItem.children?.map((child) => (
                <NavigationMenuItem key={child.id}>
                  <NavigationMenuLink
                    as="button"
                    onClick={() => setSelectedItem(child.id)}
                    className="flex items-center px-2 py-1 text-sm font-medium transition-colors hover:bg-gray-100 focus:outline-none"
                    aria-current={selectedItem === child.id ? 'page' : undefined}
                  >
                    {child.label}
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          ))}
        </NavigationMenu>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        {selectedContent && <selectedContent />}
      </div>
    </div>
  );
};

/* ---------------------- CSS (styles.css) ---------------------- */

/* Import this stylesheet in your global CSS file or directly in the component using `import './styles.css';` */

.nav-tree {
  /* Left navigation pane styling */
  border-right: 1px solid #e2e8f0;
  min-width: 16rem;
  background-color: #fff;
}

.nav-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-subtitle {
  font-size: 0.875rem;
  opacity: 0.75;
}

/* Optional focus ring for accessibility */
:focus {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Ensure keyboard navigation is handled by HeadlessUI components */

/* -------------------- Integration Instructions -------------------- */

/* 1. Install HeadlessUI (if not already) */
// npm install @headlessui/react

/* 2. Create a wrapper Provider (e.g., GamePageProvider) */

import { createContext, useState } from 'react';

const GamePageProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedItem, setSelectedItem] = useState<string>('Existing Council');
  return (
    <GamePageContext.Provider value={{ selectedItem, setSelectedItem }}>
      {children}
    </GamePageContext.Provider>
  );
};

/* 3. Wrap your application or the relevant route with GamePageProvider */

// Example for Next.js pages/app directory
// pages/_app.tsx
import '../styles/globals.css';
import { RenderGameComponent } from './components/RenderGameComponent';
import { GamePageProvider } from './providers/GamePageProvider';

export default function App({ Component, pageProps }) {
  return (
    <GamePageProvider>
      <Component {...pageProps} />
    </GamePageProvider>
  );
}

// In the /game/current page component
import { RenderGameComponent } from '@/components/RenderGameComponent';

export default function CurrentGamePage() {
  return (
    <>
      <RenderGameComponent />
    </>
  );
}

/* 4. Import the CSS file */
// In your global stylesheet (e.g., src/globals.css)
import '@/components/RenderGameComponent/styles.css';

/* 5. Ensure accessibility */
// HeadlessUI components already provide ARIA roles and keyboard navigation.
// The `aria-current="page"` attribute on the selected NavigationMenuLink improves screen reader feedback.

/* End of implementation */
