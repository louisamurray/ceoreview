type ReviewCardProps = {
  employeeName: string;
  role: string;
  department?: string;
  reviewPeriod?: string;
};

export default function ReviewCard({ employeeName, role, department, reviewPeriod }: ReviewCardProps) {
  return (
    <div className="border rounded p-4 mb-2 shadow">
      <h2 className="font-semibold text-lg">{employeeName}</h2>
      <p>Role: {role}</p>
      {department && <p>Department: {department}</p>}
      {reviewPeriod && <p>Review Period: {reviewPeriod}</p>}
    </div>
  );
}
