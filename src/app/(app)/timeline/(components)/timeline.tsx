'use client';

import { Task } from '@prisma/client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
  Title,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, TimeScale, Title);

export default function Timeline({ tasks }: { tasks: Task[] }) {
  const router = useRouter();

  useEffect(() => router.refresh(), [router]);

  const minDate = new Date(
    Math.min(...tasks.map((task) => new Date(task.createdAt).getTime())),
  );
  minDate.setDate(1);
  const maxDate = new Date(
    Math.max(...tasks.map((task) => new Date(task.dueDate).getTime())),
  );
  maxDate.setMonth(maxDate.getMonth() + 1);
  maxDate.setDate(0);

  const min = format(minDate, 'yyyy-MM-dd');
  const max = format(maxDate, 'yyyy-MM-dd');

  const labels = tasks.map((task) => task.title);

  const randomBackgroundColors = tasks.map(() => {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
  });

  const data = tasks.map((task) => ({
    x: [
      format(new Date(task.createdAt), 'yyyy-MM-dd'),
      format(new Date(task.dueDate), 'yyyy-MM-dd'),
    ],
    y: task.title,
  }));

  return (
    <div>
      <Bar
        data={{
          labels,
          datasets: [
            {
              data,
              borderWidth: 0,
              backgroundColor: randomBackgroundColors,
            },
          ],
        }}
        options={{
          indexAxis: 'y',
          responsive: true,
          elements: { bar: { borderWidth: 2 } },
          scales: {
            x: {
              ticks: { stepSize: 1 },
              type: 'time',
              display: true,
              time: { unit: 'day' },
              min,
              max,
            },
          },
        }}
      />
    </div>
  );
}
