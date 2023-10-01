import InstructorDashboard from './(instructor)';

export default async function Dashboard() {
  return (
    <div className='flex flex-col h-full'>
      <InstructorDashboard />
    </div>
  );
}
