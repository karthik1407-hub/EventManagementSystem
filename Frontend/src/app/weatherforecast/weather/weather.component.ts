import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

interface WeatherForecast {
  date: string;
  temperatureC: number;
  temperatureF: number;
  summary: string;
}

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  weatherData: WeatherForecast[] = [];
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private http: HttpClient) { }

  async ngOnInit(): Promise<void> {
    await this.getWeatherData();
  }

  async getWeatherData() {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const data = await firstValueFrom(this.http.get<WeatherForecast[]>('https://localhost:7272/WeatherForecast'));
      this.weatherData = data;
    } catch (err) {
      this.errorMessage = 'Failed to fetch weather data. The API might be offline.';
      console.error('Error fetching weather data:', err);
    } finally {
      this.isLoading = false;
    }
  }
}