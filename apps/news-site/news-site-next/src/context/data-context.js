import { createContext, useContext, useEffect, useState, useRef } from "react";
import { dataSource } from "../data";

const RTL_LOCALES = ["ar", "he", "fa", "ps", "ur"];
const DEFAULT_LANG = "en";
const DEFAULT_DIR = "ltr";

const DataContext = createContext(null);

export const DataContextProvider = ({ children }) => {
    const [value, setValue] = useState({});
    const initialized = useRef(false);

    useEffect(() => {
        if (initialized.current)
            return;

        /**
         * read lang & dir
         */
        const urlParams = new URLSearchParams(window.location.search);
        const langFromUrl = urlParams.get("lang")?.toLowerCase();
        const lang = langFromUrl && langFromUrl in dataSource ? langFromUrl : DEFAULT_LANG;
        const dir = lang && RTL_LOCALES.includes(lang) ? "rtl" : DEFAULT_DIR;

        document.documentElement.setAttribute("dir", dir);
        document.documentElement.setAttribute("lang", lang);

        /**
         * read config and fetch
         */
        const fetchData = async(url, key) => {
            const response = await fetch(url);
            const data = await response.json();
            setValue({
                lang,
                dir,
                ...dataSource[lang],
                [key]: { ...data },
            });
        };

        const configParam = urlParams.get("config");

        /**
         * decide to load config
         */
        if (configParam) {
            const configSource = process.env.TARGET && process.env.TARGET === "static" ? `./${configParam}` : `/${configParam}`;
            fetchData(configSource, "config");
        } else {
            setValue({
                lang,
                dir,
                ...dataSource[lang],
            });
        }

        initialized.current = true;
    }, []);

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useDataContext = () => {
    const dataContext = useContext(DataContext);

    if (!dataContext)
        throw new Error("A DataProvider must be rendered before using useDataContext");

    return dataContext;
};
