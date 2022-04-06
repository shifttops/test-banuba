import {
  action, observable,
} from 'mobx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import { toast } from 'react-toastify';
import {
  Effect,
  MediaStream as Media, MediaStreamCapture,
  Player,
} from '../ar/BanubaSDK';
// @ts-ignore
import data from '../ar/BanubaSDK.data';
// @ts-ignore
import wasm from '../ar/BanubaSDK.wasm';
// @ts-ignore
import simd from '../ar/BanubaSDK.simd.wasm';
// @ts-ignore
import blur from '../ar/effects/blur_bg.zip';

interface RootStoreType {
  connection: RTCPeerConnection;
  localStream: MediaStream | undefined;
  remoteStream: MediaStream | undefined;
  readonly servers: any;
  readonly firebaseConfig: {
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId: string,
  }
  app: any;
  isBlured: boolean;

  reloadTrack(flag: 'audio' | 'video'): boolean;

  setStream(stream: MediaStream, flag: 'remote' | 'local'): Promise<MediaStream>;

  createOffer(): Promise<string>;

  add(id: string): Promise<void>;

  changeBlurEffect(ref: HTMLVideoElement): Promise<void>;
}

class RoomStore implements RootStoreType {
  servers = {
    iceServers: [
      {
        urls: ['stun:stun1.1.google.com:19302', 'stun:stun2.1.google.com:19302'],
      },
    ],
    iceCandidatePoolSize: 10,
  };

  banubaToken: string = 'ul9OrIA1peRQbj1C5uL5KTRKfEC8pkAjGbiOTzWJyUuDoEvZ+kItfm3JBraGD650ra9SaE7tOqgITyv7WEWmYvIchoyXX6rUAd0pb52GjzwekfE1OmayjDjfxkON3+/3VBazdMwd9Icc2WHOXWZIDA7gj0wHT/5DvMn0ysSOsUgjNS05UXnoABrJKAaFRONxW/kudqRggICCL8nj0WbBMVYzFhimRKjgRQab3TyNp0jmW6ctyJr/d4Bf9dgkp2fryX1v8KMTw7+Qiex9+ePus6tw6RlKhwMbyL3tqctFhQUdZG+7+qh/Y7RNvTemlZlrRBTZT6Tg6XsDhf7nY179CddjuqPx43FkWE4axDPA/1xLTHE850efpm0PwPMRB0crE90SuQu/qGL3vNafdyQlEPFrv5OzCMesFx1stKR6fN8/o3sAiUax3bLaeFtvBtOPRiigrfQNNtHnJaQhjFphiYTzp1Jt6u+t02ArVfMg4Dv6oFddU2DZeiUiiatX6g9wMxYJWddc/FmqE53E2C2NZ+PJYRUgI10mbdB2DzykKFjsC+fr9ESkhi3A3kbw4EFICaZtuXua1wXTatvhKR164CsLb+x3df+leSxMULQjnbLtWVR4lINUYqEbrQe6J3wbLDbG8KEeWmeJj98R0WwQ2qfg1NE/4HdAS6cSh+UCvsYrNkwqWHlhEUZid3HoaiqUdv7MCYu87+NEDYkfMul5Oa0nc+SQB9YzkgBmcPlzIkI2/fjxQNTyRX8Ayndj1kdJUYN2Wr82ok3fYUzr04PTUgwe358ClAq7lICGPIQm+YBr8ri2qhPf8Jy3KRiirfQ3EfmcEeY0Ape3fEvvHZA5qy2G9CV3+xcmO0I7SOB1nE9ZYgoac49lhzi4wNEM/m1zLG+9e1F+p+FBDaTNojp+TEdo1qpKskz0FCzrEg1B1QB4Tu98Vu9JASoAm+ntc2m/kEZIrdW477Q+qcTJs1llAQ4g8Wg1FsSP7OGIy18upOhWhqeG5LRQcnnln9qr0qUJQhwrBhWKeg4vYSvOGoEtYLUE8NsOzpYwthsM8sslt8ET76GQgCYdDJwYTU8gWp28MqNpx+Xqql/u3ZymQV17EYInsGxOwWXP6DNFYW922KpEWWLlhEBn2Xsm6zd+EACDB9VGNyoXfKaE5PiRiFuqVQU3AM3ImRpRlibqiqsP0gJehU9L4mFE9ruQticWW/6gqZ2KSrUKxSJ5uYqx64+rntJIcuOc6lqP58GuUaU6o7b6VgNfMRBzbWRUT/2ssioOCaVjt/5mmfY7S64hGliUONsv+4LTAJ3BLH9gOe7+PG11wJ0KJev59HzpWT7WiSjjtTrzO/+tlqmRb70zjzDJX/hMCOMGUrC7b4jMCdLOC2/oyg3aH4blV+CCNbr9q5MbgvIhi2sS0J/4tn3a7OR1NY4SEqmObcYqfkMyNjaAA9ydnSzNqJWHRbhsX8Ge1gghK45bMN/3KKn4Fy+5vaXkHbX6dxix+kK+tuNNHnMVj+jVSn11xyPZClD++bNnkkpzFfqKRdr/qLXqe84qn8i89wdC043x9cE0kK7vbSDaiFxp6xQdyGqr3xB+CqqcVKyN3PhR/YIY3wocGFYPZ3HbiSZnlPwaqNZBNVu1ltR2bPFH96LI2Y6fm9Mg2Pqv1wXmleOsmS53Sgk80I4TU4JK8iS6UXnFLETvzy7tuhS6wm5kmdwwNoJxSuBjCHvujvsaPLXHD96ZlVhAdf6BI98bsLTGyQ1PdQ==';

  @observable connection: RTCPeerConnection = new RTCPeerConnection(this.servers);

  @observable localStream: MediaStream | undefined;

  @observable remoteStream: MediaStream | undefined;

  @observable isBlured: boolean = false;

  firebaseConfig = {
    apiKey: 'AIzaSyCiJ90Y8v_CyUNFTWrK6iLRb9wuQ7MYTLQ',
    authDomain: 'test-banuba.firebaseapp.com',
    projectId: 'test-banuba',
    storageBucket: 'test-banuba.appspot.com',
    messagingSenderId: '357402802026',
    appId: '1:357402802026:web:aa163fc9e1b21ec80a9713',
    measurementId: 'G-189RCJFZZ3',
  };

  app: any;

  constructor() {
    firebase.initializeApp(this.firebaseConfig);
    this.app = firebase.firestore();

    this.connection.ontrack = (ev) => {
      if (this.remoteStream) {
        if (this.remoteStream.getVideoTracks().length) {
          this.remoteStream.removeTrack(this.remoteStream.getVideoTracks()[0]);
          this.remoteStream.addTrack(ev.track);
        } else this.remoteStream.addTrack(ev.track);
      }
    };
  }

  @action.bound
  async setStream(stream: MediaStream, flag: 'remote' | 'local'): Promise<MediaStream> {
    stream.getTracks().map((track) => this.connection?.addTrack(track));

    if (flag === 'local') {
      this.localStream = stream;
      return this.localStream;
    }

    this.remoteStream = stream;
    return this.remoteStream;
  }

  @action.bound changeBlurEffect = async (ref: HTMLVideoElement): Promise<void> => {
    try {
      const player = await Player.create({
        clientToken: this.banubaToken,
        locateFile: {
          'BanubaSDK.data': data,
          'BanubaSDK.wasm': wasm,
          'BanubaSDK.simd.wasm': simd,
        },
      });
      const webar = new MediaStreamCapture(player);

      if (this.localStream) {
        player.use(new Media(this.localStream));

        if (!this.isBlured) {
          await player.applyEffect(new Effect(blur));
        }

        await player.play();

        const audio = this.localStream.getAudioTracks()[0];
        const video = !this.isBlured ? webar.getVideoTrack() : (await navigator.mediaDevices
          .getUserMedia({ video: true })).getVideoTracks()[0];

        const newStream = new MediaStream([audio, video]);

        this.localStream = newStream;

        // eslint-disable-next-line no-param-reassign
        ref.srcObject = newStream;

        await this.connection.getSenders()[1].replaceTrack(video);

        this.isBlured = !this.isBlured;
      }
    } catch (e: any) {
      toast.error(e.meesage, {
        theme: 'dark',
      });
    }
  };

  @action reloadTrack(flag: 'audio' | 'video'): boolean {
    // eslint-disable-next-line no-unsafe-optional-chaining
    const track = flag === 'audio' ? this.localStream?.getAudioTracks()[0] : this.localStream?.getVideoTracks()[0];

    if (track) {
      track.enabled = !track.enabled;
      return track.enabled;
    }

    return false;
  }

  createOffer = async (): Promise<string> => {
    const callDoc = this.app.collection('calls').doc();
    const offers = callDoc.collection('offers');
    const answers = callDoc.collection('answers');

    const { id } = callDoc;

    this.connection.onicecandidate = (event: any) => {
      if (event.candidate) {
        offers.add(event.candidate.toJSON());
      }
    };

    const offerDescription = await this.connection.createOffer();

    await this.connection.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription?.sdp,
      type: offerDescription?.type,
    };

    await callDoc.set({ offer });

    callDoc.onSnapshot((snapshot: any) => {
      const snapData = snapshot.data();

      if (!this.connection.currentRemoteDescription && snapData?.answer) {
        this.connection.setRemoteDescription(new RTCSessionDescription(snapData.answer));
      }
    });

    answers.onSnapshot((snapshot: any) => {
      // eslint-disable-next-line array-callback-return
      snapshot.docChanges().map((change: any) => {
        if (change.type === 'added') {
          this.connection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });

    return id;
  };

  add = async (id: string): Promise<void> => {
    const callDoc = this.app.collection('calls').doc(id);
    const answers = callDoc.collection('answers');
    const offers = callDoc.collection('offers');

    this.connection.onicecandidate = (event: any) => {
      if (event.candidate) {
        answers.add(event.candidate.toJSON());
      }
    };

    // @ts-ignore
    const { offer } = (await callDoc.get()).data();

    await this.connection.setRemoteDescription(new RTCSessionDescription(offer));

    const answerDescription = await this.connection.createAnswer();

    await this.connection.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await callDoc.update({ answer });

    offers.onSnapshot((snapshot: any) => {
      // eslint-disable-next-line array-callback-return
      snapshot.docChanges().map((change: any) => {
        if (change.type === 'added') {
          this.connection.addIceCandidate(new RTCIceCandidate(change.doc.data()));
        }
      });
    });
  };
}

export default new RoomStore();
