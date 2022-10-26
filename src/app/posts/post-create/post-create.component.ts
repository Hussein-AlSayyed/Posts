import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, ParamMap } from "@angular/router";

import { Post } from "../post.model";
import { PostsService } from "../posts.service";
import { mimeType } from './7.1 mime-type.validator'

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"]
})
export class PostCreateComponent implements OnInit {
  private mode = 'create';
  private postId: string;
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;

  constructor(public postsService: PostsService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.form = new FormGroup({
      'title': new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      'content': new FormControl(null, { validators: [Validators.required] }),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.isLoading = true;
        this.postId = paramMap.get('postId');
        this.postsService.getPostById(this.postId)
          .subscribe(
            postData => {
              this.isLoading = false;
              this.imagePreview = postData.imagePath;
              this.post = {
                id: postData._id,
                title: postData.title,
                content: postData.content,
                imagePath: postData.imagePath,
                creator: postData.creator
              };
              this.form.setValue({
                'title': this.post.title,
                'content': this.post.content,
                'image': this.post.imagePath,
              });
            }
          );
      } else {
        this.postId = null;
        this.mode = 'create';
      }
    })
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    if (file) {
      this.form.patchValue({ 'image': file });
      this.form.get('image').updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      }
      reader.readAsDataURL(file);
    }

  }

  onSavePost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.mode === 'create') {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }
    this.form.reset();
  }
}
