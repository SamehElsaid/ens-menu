import CardDashBoard from "../Card/CardDashBoard";
import FormInformation from "./FormInformation";

export default function Information({
  type,
}: {
  type?: "specialist" | "parent";
}) {
  return (
    <CardDashBoard>
      <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
      <FormInformation type={type} />
    </CardDashBoard>
  );
}
