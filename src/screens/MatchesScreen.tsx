import React, {useCallback, useEffect, useState} from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import {MATCHES_URL} from '../config';
import {FavoriteButton} from '../components/FavoriteButton';
import {UpdatedAgo} from '../components/UpdatedAgo';
import {useFavorites} from '../hooks/useFavorites';

type Team = {
    id: string;
    name: string;
    city: string;
};

type Match = {
    id: string;
    startsAt: string | null;
    status: 'finished' | 'live' | 'scheduled' | 'postponed' | string;
    minute?: number;
    home: Team;
    away: Team;
    score: {home: number; away: number} | null;
};

type MatchesResponse = {
    round: number;
    matches: Match[];
};

type FilterType = 'all' | 'upcoming' | 'finished';

type MatchesScreenProps = {
    isDark: boolean;
    toggleTheme: () => void;
};

function getStatusText(match: Match): string {
    switch (match.status) {
        case 'finished': return 'Завершен';
        case 'live': return `В прямом эфире (${match.minute}')`;
        case 'scheduled': return 'Запланирован';
        case 'postponed': return 'Перенесен';
        default: return match.status;
    }
}

function formatDate(dateString: string | null): string {
    if (!dateString) return 'Дата не назначена';
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function MatchesScreen({isDark, toggleTheme}: MatchesScreenProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<FilterType>('all');
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const {isFavorite, toggle} = useFavorites();

    const fetchMatches = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(MATCHES_URL);
            if (!response.ok) {
                throw new Error('Ошибка сети');
            }
            const data: MatchesResponse = await response.json();
            setMatches(data.matches);
            setLastUpdated(new Date());
        } catch (err) {
            setError('Не удалось загрузить матчи. Проверьте интернет.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMatches();
    }, [fetchMatches]);

    const filteredMatches = matches.filter((match) => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') return match.status === 'scheduled';
        if (filter === 'finished') return match.status === 'finished';
        return true;
    });

    return (
        <View style={[styles.container, isDark && styles.containerDark]}>
            <View style={styles.header}>
                <Text style={[styles.title, isDark && styles.textDark]}>Матчи тура</Text>

                <View style={styles.headerActions}>
                    <Pressable
                        onPress={toggleTheme}
                        style={[styles.themeButton, isDark && styles.themeButtonDark]}
                    >
                        <Text style={{fontSize: 20}}>{isDark ? '☀️' : '🌙'}</Text>
                    </Pressable>

                    <Pressable onPress={fetchMatches} style={styles.refreshButton}>
                        <Text style={styles.refreshText}>Обновить</Text>
                    </Pressable>
                </View>
            </View>

            <UpdatedAgo since={lastUpdated} />

            <View style={styles.filters}>
                {(['all', 'upcoming', 'finished'] as FilterType[]).map((f) => (
                    <Pressable
                        key={f}
                        onPress={() => setFilter(f)}
                        style={[
                            styles.filterBtn,
                            isDark && styles.filterBtnDark,
                            filter === f && styles.filterBtnActive
                        ]}
                    >
                        <Text style={filter === f ? styles.filterTextActive : (isDark ? styles.filterTextDark : styles.filterText)}>
                            {f === 'all' ? 'Все' : f === 'upcoming' ? 'Предстоящие' : 'Завершённые'}
                        </Text>
                    </Pressable>
                ))}
            </View>

            {isLoading ? (
                <ActivityIndicator size="large" color="#ef3124" style={styles.center} />
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={fetchMatches} style={styles.retryButton}>
                        <Text style={styles.retryText}>Повторить</Text>
                    </Pressable>
                </View>
            ) : filteredMatches.length === 0 ? (
                <View style={styles.center}>
                    <Text style={isDark ? styles.textSecondaryDark : styles.emptyText}>Нет матчей для отображения</Text>
                </View>
            ) : (
                <FlatList
                    data={filteredMatches}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.list}
                    renderItem={({item}) => (
                        <View style={[styles.card, isDark && styles.cardDark]}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.dateText, isDark && styles.textSecondaryDark]}>{formatDate(item.startsAt)}</Text>
                                <FavoriteButton
                                    active={isFavorite(item.id)}
                                    onPress={() => toggle(item.id)}
                                />
                            </View>
                            <Text style={[styles.teams, isDark && styles.textDark]}>
                                {item.home.name} — {item.away.name}
                            </Text>
                            {item.score ? (
                                <Text style={styles.score}>
                                    {item.score.home} : {item.score.away}
                                </Text>
                            ) : (
                                <Text style={[styles.scorePlaceholder, isDark && styles.textSecondaryDark]}>Счет не известен</Text>
                            )}
                            <Text style={[styles.statusText, isDark && styles.textSecondaryDark]}>{getStatusText(item)}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#f9fafb',
    },
    containerDark: {
        backgroundColor: '#111827',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    themeButton: {
        padding: 6,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    themeButtonDark: {
        backgroundColor: '#374151',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
    },
    textDark: {
        color: '#f9fafb',
    },
    textSecondaryDark: {
        color: '#9ca3af',
    },
    refreshButton: {
        padding: 8,
    },
    refreshText: {
        color: '#ef3124',
        fontWeight: '600',
    },
    filters: {
        flexDirection: 'row',
        marginVertical: 12,
        gap: 8,
    },
    filterBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        backgroundColor: '#e5e7eb',
    },
    filterBtnDark: {
        backgroundColor: '#374151',
    },
    filterBtnActive: {
        backgroundColor: '#ef3124',
    },
    filterText: {
        color: '#374151',
    },
    filterTextDark: {
        color: '#d1d5db',
    },
    filterTextActive: {
        color: '#fff',
        fontWeight: 'bold',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: 'red',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#ef3124',
        padding: 10,
        borderRadius: 8,
    },
    retryText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    emptyText: {
        color: '#6b7280',
        fontSize: 16,
    },
    list: {
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardDark: {
        backgroundColor: '#1f2937',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    dateText: {
        fontSize: 13,
        color: '#6b7280',
    },
    teams: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    score: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ef3124',
        marginBottom: 4,
    },
    scorePlaceholder: {
        fontSize: 14,
        color: '#9ca3af',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 13,
        color: '#374151',
    },
});
