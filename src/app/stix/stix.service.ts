import { Injectable }    from '@angular/core';
import { Headers, Http } from '@angular/http';
import { Observable }     from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { BaseStixService } from '../base-stix.service';
import { Sighting } from '../../models';

@Injectable()
export class StixService {
    public url = '';  // URL to web api
    private headers = new Headers({'Content-Type': 'application/json'});

    constructor(private http: Http) { }

    public load(): Observable<any[]> {
        const url = `${this.url}`;
        return this.http
               .get(url)
               .map((response) => {
                   return response.json().data as any[];
                })
                .catch(this.handleError);
    }

    public get(id: number): Observable<any> {
        console.log('********* ' + id);
        const url = `${this.url}/${id}`;
        return this.http
            .get(url)
            .map((response) => {
                return response.json().data;
            })
            .catch(this.handleError);
    }

<<<<<<< HEAD
    public delete(id: number): Observable<void> {
        const url = `${this.url}/${id}`;
        return this.http
            .delete(url, {headers: this.headers})
            .map((response) => {
                return response.json().data;
            })
            .catch(this.handleError);
    }
=======
  public delete(id: string): Observable<void> {
    const url = `${this.url}/${id}`;
    return this.http
        .delete(url, {headers: this.headers})
        .map((response) => {
            return response.json();
        })
        .catch(this.handleError);
  }
>>>>>>> d8d318e515a7f5b3618597b65fcfb650c8bdef5b

    public create(item: any): Observable<any> {
        return this.http
            .post(this.url, JSON.stringify(item), {headers: this.headers})
            .map((response) => {
                return response.json().data;
            })
            .catch(this.handleError);
    }

<<<<<<< HEAD
    public update(item: any): Observable<any> {
        const url = `${this.url}/${item.id}`;
        return this.http
            .put(url, JSON.stringify(item), {headers: this.headers})
            .map((response) => {
                return response.json().data;
            })
            .catch(this.handleError);
    }
=======
  public update(item: any): Observable<any> {
    const url = `${this.url}/${item.id}`;
    return this.http
        .patch(url, JSON.stringify(item.attributes), {headers: this.headers})
        .map((response) => {
            return response.json().data;
        })
        .catch(this.handleError);
  }
>>>>>>> d8d318e515a7f5b3618597b65fcfb650c8bdef5b

    private handleError(error: any): Observable<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Observable.throw(error.message || error);
    }
}
