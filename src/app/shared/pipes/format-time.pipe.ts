import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatTime',
  standalone: true // Making it a standalone pipe
})
export class FormatTimePipe implements PipeTransform {

  transform(value: string | Date | null | undefined, format: string = 'short'): string | null {
    if (!value) {
      return null;
    }

    const date = (value instanceof Date) ? value : new Date(value);

    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }

    // Basic formatting logic - you can extend this based on your needs
    switch (format) {
      case 'short': // e.g., 11/10/2023, 10:30 AM
        return date.toLocaleString();
      case 'date': // e.g., November 10, 2023
        return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
      case 'time': // e.g., 10:30:00 AM
        return date.toLocaleTimeString();
      case 'yyyy-MM-dd': // e.g., 2023-11-10
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
      // Add more cases for different formats as needed
      default:
        return date.toLocaleString();
    }
  }

} 