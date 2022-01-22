import Spinner from "components/Spinner";

export default function LoadingSection() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner className="h-6 w-6 text-white" />
    </div>
  );
}
