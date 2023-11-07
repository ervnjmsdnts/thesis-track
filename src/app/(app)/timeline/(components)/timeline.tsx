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
import { format, isValid } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Ghost } from 'lucide-react';

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

  const min = format(isValid(minDate) ? minDate : new Date(), 'yyyy-MM-dd');
  const max = format(isValid(maxDate) ? maxDate : new Date(), 'yyyy-MM-dd');

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
      {tasks && tasks.length > 0 ? (
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
      ) : (
        <div className='flex flex-col items-center gap-2 mt-16'>
          <Ghost className='h-8 w-8 text-zinc-800' />
          <h3 className='font-semibold text-xl'>No Tasks</h3>
        </div>
      )}
    </div>
  );
}
