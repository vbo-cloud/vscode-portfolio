import { resolveTechTierStyle } from '../../utils/helpers';

export const TechTag = ({ label }: { label: string }) => {
    const { bg, fg, border } = resolveTechTierStyle(label);
    return (
        <span
            className="px-2 py-0.5 text-[10px] md:text-xs font-medium rounded-sm whitespace-nowrap border"
            style={{ color: fg, backgroundColor: bg, borderColor: border }}
        >
            {label}
        </span>
    );
};
