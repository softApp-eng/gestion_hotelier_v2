import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { TypeClientReponseDto } from 'src/app/core/services/models/TypeClientReponseDto';
import { TypeClientService } from 'src/app/core/services/type-client.service';

@Component({
  selector: 'app-list-type-client',
  templateUrl: './list-type-client.component.html',
  styleUrls: ['./list-type-client.component.scss']
})
export class ListTypeClientComponent implements OnInit,AfterViewInit {

 displayedColumns: string[] = ['id', 'code', 'libelle', 'description', 'actions'];
  dataSource = new MatTableDataSource<TypeClientReponseDto>();
  loading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private typeClientService: TypeClientService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadData(): void {
    this.loading = true;
    this.typeClientService.getAll().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement:', err);
        this.loading = false;
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
