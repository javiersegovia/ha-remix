interface PayrollAdvanceSummaryItemProps {
  label: string | JSX.Element
  value: string | JSX.Element
}

export const PayrollAdvanceSummaryItem = ({
  label,
  value,
}: PayrollAdvanceSummaryItemProps) => (
  <div className="flex items-center justify-between text-sm">
    <div className="font-medium text-gray-700">{label}</div>
    <div className="max-w-[270px] text-gray-700">{value}</div>
  </div>
)
