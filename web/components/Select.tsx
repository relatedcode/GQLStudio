import classNames from "utils/classNames";

export default function Select({
  setFieldValue,
  value,
  name,
  label,
  options,
  className,
}: {
  setFieldValue: any;
  value: any;
  name: string;
  label: string;
  options: any;
  className?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-white">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={(e) => setFieldValue(name, e.target.value)}
        className={classNames(
          "mt-1 bg-transparent text-white block w-full pl-3 pr-10 py-2 text-base border-gray-500 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md",
          className
        )}
      >
        {options.map((template) => (
          <option key={template.value} value={template.value}>
            {template.title}
          </option>
        ))}
      </select>
    </div>
  );
}
