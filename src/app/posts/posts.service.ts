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
              imagePath: post.imagePath,
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
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>('http://localhost:3000/api/posts/' + postId);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', image, title);
    this.http
      .post<{ message: string, post: Post }>('http://localhost:3000/api/posts', postData)
      .subscribe((postResponse) => {
        console.log(postResponse.post);
        const post: Post = { id: postResponse.post.id, title: title, content: content, imagePath: postResponse.post.imagePath };
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
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
      postData = { id: postId, title: title, content: content, imagePath: image };
    }
    this.http.put<{ message: string }>('http://localhost:3000/api/posts/' + postId, postData)
      .subscribe(() => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === postId);
        const post = { id: postId, title: title, content: content, imagePath: "" };
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
