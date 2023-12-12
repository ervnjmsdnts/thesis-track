'use client';

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Group } from '@prisma/client';

ChartJS.register(ArcElement, Tooltip, Legend);

export const data = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      data: [12, 19, 3, 5, 2, 3],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)',
      ],
      cutout: '70%',
    },
  ],
};

export default function CollectionMilestone({
  groups,
}: {
  groups: Group[] | undefined;
}) {
  const countGroupsByProgression = (groups: Group[] | undefined) => {
    const progressionCounts: { [key: string]: number } = {};

    if (!groups) return null;

    groups.forEach((group) => {
      const progression = group.progression;
      progressionCounts[progression] =
        (progressionCounts[progression] || 0) + 1;
    });

    const data = {
      labels: Object.keys(progressionCounts),
      datasets: [
        {
          data: Object.values(progressionCounts),
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          cutout: '70%',
        },
      ],
    };

    return data;
  };

  const chartData = countGroupsByProgression(groups);

  if (!chartData) return null;

  return (
    <Doughnut
      data={chartData}
      width='200px'
      height='200px'
      options={{
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
        },
      }}
    />
  );
}
