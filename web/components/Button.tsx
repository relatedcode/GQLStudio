import classNames from "utils/classNames";
import Spinner from "components/Spinner";

export default function Button({
  text,
  type = "button",
  className,
  onClick,
  disabled = false,
  white = false,
  icon,
  loading = false,
}: {
  text: string;
  type?: "submit" | "button";
  className?: string;
  white?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  icon?: any;
  loading?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classNames(
        className,
        white
          ? "bg-transparent border border-gray-500 text-white"
          : "border border-transparent text-white bg-green-600 hover:bg-green-700",
        "ml-3 inline-flex justify-center items-center py-2 px-4 shadow-sm text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ring-offset-gray-800 disabled:opacity-50"
      )}
    >
      {loading ? <Spinner className="mr-2" /> : icon}
      {text}
    </button>
  );
}
