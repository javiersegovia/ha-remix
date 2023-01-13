interface AdvanceSummaryItemProps {
  label: string | JSX.Element
  value: string | JSX.Element
}

export const AdvanceSummaryItem = ({
  label,
  value,
}: AdvanceSummaryItemProps) => (
  <div className="flex items-center justify-between text-sm">
    <div className="font-medium text-gray-700">{label}</div>
    <div className="max-w-[270px] text-gray-700">{value}</div>
  </div>
)
