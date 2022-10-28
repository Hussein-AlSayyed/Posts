import { map, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Post } from './post.model';
import { environment } from '../../environments/environment'

const BACKEND_URL = environment.apiURL + '/posts/'

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], maxPostsCount: number }>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts(pageSize: number, page: number) {
    const queryParams = new HttpParams().set('pagesize', pageSize).set('page', page);
    this.http
      .get<{ message: string, posts: any, maxPostsCount: number }>(BACKEND_URL, { params: queryParams })
      .pipe(
        map(postsData => {
          return {
            posts: postsData.posts.map((post) => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
              }
            }),
            maxPostsCount: postsData.maxPostsCount,
          }
        })
      )
      .subscribe((updatedPostsData) => {
        this.posts = updatedPostsData.posts;
        this.postsUpdated.next({ posts: [...this.posts], maxPostsCount: updatedPostsData.maxPostsCount });
      })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPostById(postId: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string, creator: string }>(BACKEND_URL + postId);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string, post: Post }>(BACKEND_URL, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      })
  }

  updatePost(postId: string, title: string, content: string, image: File | string) {
    let postData: FormData | Post;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', postId);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { id: postId, title: title, content: content, imagePath: image, creator: null };
    }
    this.http.put<{ message: string }>(BACKEND_URL + postId, postData)
      .subscribe(() => {
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId);
  }

}
