import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";
import { Post } from "../post.model";

import { PostsService } from "../posts.service";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  private mode = 'create';
  private postId: string;
  post: Post;
  isLoading = false;

  constructor(public postsService: PostsService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.isLoading = true;
        this.postId = paramMap.get('postId');
        this.postsService.getPostById(this.postId)
          .subscribe(
            post => {
              this.isLoading = false;
              this.post = { id: post._id, title: post.title, content: post.content }
            }
          );
      } else {
        this.postId = null;
        this.mode = 'create';
      }
    })
  }

  onSavePost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(form.value.title, form.value.content);
    } else {
      this.postsService.updatePost(this.postId, form.value.title, form.value.content);
    }
    form.resetForm();
  }
}
