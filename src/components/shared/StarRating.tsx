import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    onChange: (rating: number) => void;
    size?: number;
    editable?: boolean;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    onChange,
    size = 24,
    editable = true,
}) => {
    const [hover, setHover] = useState(0);

    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => editable && onChange(star)}
                    onMouseEnter={() => editable && setHover(star)}
                    onMouseLeave={() => editable && setHover(0)}
                    className={`transition-all ${editable ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                >
                    <Star
                        size={size}
                        className={`${star <= (hover || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300 dark:text-slate-600'
                            }`}
                    />
                </button>
            ))}
        </div>
    );
};
