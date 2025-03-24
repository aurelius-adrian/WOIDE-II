export default function ErrorMessage({
  errorMessage,
}: {
  errorMessage: string;
}) {
  return <div className=" text-red-200 text-sm italic">{errorMessage}</div>;
}
