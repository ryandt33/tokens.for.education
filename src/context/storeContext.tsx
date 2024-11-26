import React, {
  createContext,
  useState,
  useCallback,
  ReactNode,
  SetStateAction,
  Dispatch,
} from "react";
import { Message, Role, Tab } from "../resources/types";

export interface Store {
  apiKey?: string;
  error?: string;
  messages?: Message[];
  models?: {
    id: string;
  }[];
  selectedModel?: string;
  temperature: number;
}

export interface StoreContextType {
  store: Store;
  tabs: Tab[];
  activeTab: number;
  setStore: (Store: Store) => void;
  updateStore: (newProps: Partial<Store>) => void;
  addTab: (tab: Tab) => void;
  updateTabMessages: (newMessages: Message[], index?: number) => void;
  removeTab: (tabIndexToRemove: number) => void;
  renameTab: (name: string, tabIndex: number) => void;
  setLoading: (loading: boolean, tabIndex?: number) => number;
  setActiveTab: Dispatch<SetStateAction<number>>;
  temperature: number;
  setTemperature: Dispatch<SetStateAction<number>>;
}

const defaultStore: Store = {
  apiKey: "",
  error: "",
  messages: [
    {
      role: Role.USER,
      content: "",
    },
  ],
  models: [
    { id: "gpt-4o-mini" },
    {
      id: "gpt-4o",
    },
  ],
  selectedModel: "gpt-4o-mini",
  temperature: 0,
};

const defaultTab: Tab[] = [
  {
    name: "Tab #1",
    messages: [
      {
        role: Role.USER,
        content: "",
      },
    ],
    loading: false,
  },
];

export const StoreContext = createContext<StoreContextType | undefined>(
  undefined
);

interface StoreProviderProps {
  children: ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  const [store, setStoreState] = useState<Store>(defaultStore);
  const [tabs, setTabState] = useState<Tab[]>(defaultTab);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [temperature, setTemperature] = useState<number>(0);

  const setStore = useCallback((newStore: Store) => {
    setStoreState(newStore);
  }, []);

  const updateStore = (newProps: Partial<Store>) => {
    setStore({ ...store, ...newProps });
  };

  const updateTabMessages = (
    newMessages: Message[],
    index: number = activeTab
  ) => {
    const newTabs = tabs.map((t, i) => {
      if (i === index) {
        t.messages = newMessages;
      }

      return t;
    });

    setTabState(newTabs);
  };

  const checkAndReturnName = (index: number): string => {
    const newName = `Tab #${index}`;

    const nameExists = tabs.find((t) => t.name === newName);

    if (nameExists) {
      return checkAndReturnName(index + 1);
    }

    return newName;
  };

  const addTab = () => {
    const newTab = {
      name: checkAndReturnName(tabs.length),
      messages: [
        {
          role: Role.USER,
          content: "",
        },
      ],
      loading: false,
    };
    const newTabList = [...tabs, newTab];

    setTabState(newTabList);

    setActiveTab(newTabList.length - 1);
  };

  const removeTab = (tabIndexToRemove: number) => {
    if (tabIndexToRemove === activeTab) {
      const newTabIndex = activeTab !== 0 ? activeTab - 1 : tabs.length - 2;

      setActiveTab(newTabIndex);
    }

    const newTabList = tabs.filter((_t, i) => i !== tabIndexToRemove);

    setTabState(newTabList);
  };

  const renameTab = (name: string, tabIndex: number) => {
    const newTabs = tabs.map((t, i) => {
      if (tabIndex === i) {
        t.name = name;
      }

      return t;
    });

    setTabState(newTabs);
  };

  const setLoading = (loading: boolean, tabIndex: number = activeTab) => {
    const newTabs = tabs.map((t, i) => {
      if (i === tabIndex) {
        t.loading = loading;
      }
      return t;
    });

    setTabState(newTabs);

    return tabIndex;
  };

  return (
    <StoreContext.Provider
      value={{
        store,
        tabs,
        addTab,
        removeTab,
        activeTab,
        setActiveTab,
        setStore,
        updateStore,
        renameTab,
        updateTabMessages,
        setLoading,
        temperature,
        setTemperature,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
