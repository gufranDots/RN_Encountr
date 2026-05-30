import { createContext, ReactNode, useContext } from 'react';
import { darkTheme, lightTheme } from './index';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../redux/reduxReducers/themeReducers';
import { useColorScheme } from 'react-native';

const ThemeContext = createContext({
    theme: lightTheme,
    toggleTheme: () => { },
    isDark: false,
});

// Custom hook to access the theme context
export const useTheme = () => useContext(ThemeContext);

// ThemeProvider component that provides the theme and toggle function
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const dispatch = useDispatch();
    const { mode } = useSelector((state: any) => state.themeReducers);
    const systemScheme = useColorScheme();

    const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

    const toggleTheme = () => {
        dispatch(setTheme(isDark ? 'system' : 'dark'));
    };

    const theme = isDark ? darkTheme : lightTheme;

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
};
