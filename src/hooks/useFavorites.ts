import {useState, useEffect} from 'react';

const STORAGE_KEY = 'favorites_matches';

export function useFavorites() {
    const [favorites, setFavorites] = useState<string[]>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }, [favorites]);

    const isFavorite = (id: string) => favorites.includes(id);

    const toggle = (id: string) => {
        setFavorites((prev) =>
            prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
        );
    };

    return {favorites, isFavorite, toggle};
}
