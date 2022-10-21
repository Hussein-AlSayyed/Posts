import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { response } from 'express';
import { map, Subject } from 'rxjs';

import { Post } from './post.model';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) { }

  getPosts() {
    this.http
      .get<{ message: string, posts: any }>('http://localhost:3000/api/posts')
      .pipe(
        map(postsData => {
          return postsData.posts.map((post) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
            }
          })
        })
      )
      .subscribe((upDatedPosts) => {
        this.posts = upDatedPosts;
        this.postsUpdated.next([...this.posts]);
      })
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPostById(postId: string) {
    return this.http.get<{ _id: string, title: string, content: string }>('http://localhost:3000/api/posts/' + postId);
  }

  addPost(title: string, content: string) {
    const post: Post = { id: null, title: title, content: content };
    this.http
      .post<{ message: string, postId: string }>('http://localhost:3000/api/posts', post)
      .subscribe((postResponse) => {
        const postId = postResponse.postId;
        post.id = postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      })
  }

  updatePost(postId: string, title: string, content: string) {
    const post = { id: postId, title: title, content: content };
    this.http.put<{ message: string }>('http://localhost:3000/api/posts/' + postId, post)
      .subscribe(() => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === postId);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      });
  }

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/api/posts/' + postId)
      .subscribe((response) => {
        const updatedPosts = this.posts.filter(post => {
          return post.id !== postId;
        });
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);

      });
  }

}
