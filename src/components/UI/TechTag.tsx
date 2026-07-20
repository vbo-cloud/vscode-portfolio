import { getTechColor } from '../../utils/helpers';

export const TechTag = ({ label }: { label: string }) => {
    const hex = getTechColor(label);
    return (
        <span
            className="px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-sm whitespace-nowrap"
            style={{ color: hex, backgroundColor: `${hex}20` }}
        >
            {label}
        </span>
    );
};
