import {StatusBar} from 'expo-status-bar';
import {StyleSheet, View, useColorScheme} from 'react-native';
import {useState} from 'react';
import {MatchesScreen} from './src/screens/MatchesScreen';

export default function App() {
    const systemTheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemTheme === 'dark');

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <View style={[styles.root, isDark && styles.rootDark]}>
            <MatchesScreen isDark={isDark} toggleTheme={toggleTheme} />
            <StatusBar style={isDark ? "light" : "dark"} />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        paddingTop: 48,
        backgroundColor: '#fff',
    },
    rootDark: {
        backgroundColor: '#111827',
    },
});
