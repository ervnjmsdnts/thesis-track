'use client';

import { Task } from '@prisma/client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

ChartJS.register(CategoryScale, LinearScale, BarElement, TimeScale);

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
          plugins: {
            tooltip: { enabled: false },
            legend: { display: false },
            title: { display: false },
          },
          elements: { bar: { borderWidth: 2 } },
          scales: {
            y: {
              ticks: {
                crossAlign: 'center',
                callback: function (value) {
                  const label = this.getLabelForValue(value as number);
                  return label.split(' ');
                },
              },
            },
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
