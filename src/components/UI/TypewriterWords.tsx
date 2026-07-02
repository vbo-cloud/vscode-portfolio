import React, { useState, useEffect } from 'react';

interface TypewriterWordsProps {
    words: string[];
    typingSpeed?: number;
    deletingSpeed?: number;
    pauseDuration?: number;
    className?: string;
}

export const TypewriterWords = ({
    words,
    typingSpeed = 90,
    deletingSpeed = 45,
    pauseDuration = 1600,
    className
}: TypewriterWordsProps) => {
    const [wordIndex, setWordIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const currentWord = words[wordIndex % words.length];

        if (!isDeleting && displayedText === currentWord) {
            const timeout = setTimeout(() => setIsDeleting(true), pauseDuration);
            return () => clearTimeout(timeout);
        }

        if (isDeleting && displayedText === '') {
            setIsDeleting(false);
            setWordIndex(prev => (prev + 1) % words.length);
            return;
        }

        const timeout = setTimeout(() => {
            setDisplayedText(prev =>
                isDeleting ? currentWord.slice(0, prev.length - 1) : currentWord.slice(0, prev.length + 1)
            );
        }, isDeleting ? deletingSpeed : typingSpeed);

        return () => clearTimeout(timeout);
    }, [displayedText, isDeleting, wordIndex, words, typingSpeed, deletingSpeed, pauseDuration]);

    return (
        <span className={className}>
            {displayedText}
            <span className="text-[var(--accent)] animate-[blink_1s_steps(1)_infinite]">_</span>
        </span>
    );
};
