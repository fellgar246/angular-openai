import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ChatMessageComponent, MyMessageComponent, TypingLoaderComponent, TextMessageBoxComponent, GptMessageEditableImageComponent } from '@components/index';
import { Message } from '@interfaces/message.interface';
import { OpenAiService } from 'app/presentation/services/openai.service';

@Component( {
  selector: 'app-image-tunning-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ChatMessageComponent,
    MyMessageComponent,
    TypingLoaderComponent,
    TextMessageBoxComponent,
    GptMessageEditableImageComponent,
  ],
  templateUrl: './imageTunningPage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
} )
export default class ImageTunningPageComponent { 
  public messages = signal<Message[]>([
    {
      isGpt: true,
      text: '',
      imageInfo: {
        url: '',
        alt: ''
      }
    }
  ]);
  public isLoading = signal(false);
  public openAiService = inject( OpenAiService );

  public originalImage = signal<string|undefined>(undefined);



  handleMessage( prompt: string ) {
    this.isLoading.set(true);
    this.messages.update( prev => [...prev, { isGpt: false, text: prompt }] );

    this.openAiService.imageGeneration(prompt)
      .subscribe( resp => {
        this.isLoading.set(false);
        if (!resp) return;

        this.messages.update(prev => [
          ...prev,
          {
            isGpt: true,
            text: resp.alt,
            imageInfo: resp
          }
        ])
      })
  }

  handleImageChange(newImage: string, originalImage: string) {
    this.originalImage.set(originalImage);
    //TODO: mask

    console.log({ newImage, originalImage})

  }

  generateVariation() {
    if ( !this.originalImage() ) return;

    this.isLoading.set(true);

    this.openAiService.imageVariation(this.originalImage()!)
      .subscribe( resp => {
        this.isLoading.set(false);
        if(!resp) return;

        this.messages.update(prev => [
          ...prev,
          {
            isGpt: true,
            text: resp.alt,
            imageInfo: resp
          }
        ])
      })

  }


}
