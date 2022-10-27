import { Subscription } from 'rxjs';
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: "app-post-list",
  templateUrl: "./post-list.component.html",
  styleUrls: ["./post-list.component.css"]
})
export class PostListComponent implements OnInit, OnDestroy {

  constructor(public postsService: PostsService, private authService: AuthService) { }

  posts: Post[] = [];
  private postsSub: Subscription;
  isLoading = false;
  totalPosts = 0;
  currentPage = 1;
  postsPerPage = 2;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  private authListnerSubs: Subscription;
  userId: string;
  @ViewChild('postsPaginator') postsPaginator: MatPaginator;


  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((postsData: { posts: Post[], maxPostsCount: number }) => {
        this.isLoading = false;
        this.totalPosts = postsData.maxPostsCount;
        this.posts = postsData.posts;
      });
    this.authListnerSubs = this.authService.getAuthStatusListner()
      .subscribe(isAthenticated => {
        this.userIsAuthenticated = isAthenticated;
        this.userId = this.authService.getUserId();
      })
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authListnerSubs.unsubscribe();
  }

  onChangedPage(pageData: PageEvent) {
    this.currentPage = pageData.pageIndex + 1;
    this.isLoading = true;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }

  onDelete(id: string) {
    this.isLoading = true;
    if (this.posts.length === 1) {
      this.currentPage = this.currentPage - 1;
      this.postsPaginator.pageIndex = this.currentPage - 1;
    }
    this.postsService.deletePost(id).subscribe({
      next: () => {
        this.postsService.getPosts(this.postsPerPage, this.currentPage);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
