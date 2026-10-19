import {useEffect, useRef, useState} from 'react';
import {StyleSheet, Text} from 'react-native';

type Props = {
    since: Date;
};

export function UpdatedAgo({since}: Props) {
    const [seconds, setSeconds] = useState(0);
    const sinceRef = useRef(since.getTime());

    useEffect(() => {
        if (sinceRef.current !== since.getTime()) {
            sinceRef.current = since.getTime();
            setSeconds(0);
        }

        const interval = setInterval(() => {
            const diff = Math.floor((Date.now() - sinceRef.current) / 1000);
            setSeconds(diff >= 0 ? diff : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, [since]);

    return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
    text: {
        fontSize: 13,
        color: '#6b7280',
    },
});
