import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ReceivableDto } from "../models/receivable.dto";

@Injectable({providedIn: 'root'})
export class ReceivableApi{
    private http = inject(HttpClient);
    private baseUrl = 'https://localhost:7108/api/Receivables';

    getAll(): Observable<ReceivableDto[]>{
        return this.http.get<ReceivableDto[]>(this.baseUrl);
    }

    getById(id: string): Observable<ReceivableDto>{
        return this.http.get<ReceivableDto>(`${this.baseUrl}/${id}`);
    }

    create(dto: Partial<ReceivableDto>): Observable<ReceivableDto>{
        return this.http.post<ReceivableDto>(this.baseUrl, dto);
    }

    update(dto: ReceivableDto): Observable<ReceivableDto>{
        return this.http.put<ReceivableDto>(this.baseUrl, dto);
    }
}
