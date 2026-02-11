import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { ReceivableDto } from '../models/receivable.dto';

type ReceivablesQuery = {
    year?: number;
    month?: number;
};

@Injectable({providedIn: 'root'})
export class ReceivableApi{
    private http = inject(HttpClient);
    private baseUrl = environment.receivablesApiBaseUrl;

    getAll(query?: ReceivablesQuery): Observable<ReceivableDto[]>{
        let params = new HttpParams();

        if (query?.year !== undefined) {
            params = params.set('year', `${query.year}`);
        }
        if (query?.month !== undefined) {
            params = params.set('month', `${query.month}`);
        }

        return this.http.get<ReceivableDto[]>(this.baseUrl, { params });
    }

    getById(id: string): Observable<ReceivableDto>{
        return this.http.get<ReceivableDto>(`${this.baseUrl}/${id}`);
    }

    create(dto: Partial<ReceivableDto>): Observable<ReceivableDto>{
        return this.http.post<ReceivableDto>(this.baseUrl, dto);
    }

    createBatch(dtos: Partial<ReceivableDto>[]): Observable<{ ids: string[] }>{
        return this.http.post<{ ids: string[] }>(`${this.baseUrl}/batch`, dtos);
    }

    update(id: string, dto: Partial<ReceivableDto>): Observable<void>{
        return this.http.put<void>(`${this.baseUrl}/${id}`, dto);
    }
}
