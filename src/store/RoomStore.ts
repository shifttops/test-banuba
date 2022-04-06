import {
  action, observable,
} from 'mobx';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
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
  firebaseConfig: {
    apiKey: string,
    authDomain: string,
    projectId: string,
    storageBucket: string,
    messagingSenderId: string,
    appId: string,
    measurementId: string,
  }
  app: any;

  reloadTrack(flag: 'audio' | 'video'): boolean;
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

  banubaToken: string = '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';

  @observable connection: RTCPeerConnection = new RTCPeerConnection(this.servers);

  @observable localStream: MediaStream | undefined;

  @observable remoteStream: MediaStream | undefined;

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
      console.log(ev.track);
      if (this.remoteStream) {
        if (this.remoteStream.getVideoTracks().length) {
          this.remoteStream.removeTrack(this.remoteStream.getVideoTracks()[0]);
          this.remoteStream.addTrack(ev.track);
        } else this.remoteStream.addTrack(ev.track);
      }
    };
  }

  @action.bound async setStream(stream: MediaStream, flag: 'remote' | 'local'): Promise<MediaStream> {
    stream.getTracks().map((track) => this.connection?.addTrack(track));

    if (flag === 'local') {
      this.localStream = stream;
      return this.localStream;
    }

    this.remoteStream = stream;
    return this.remoteStream;
  }

  @action.bound addBlur = async (ref: HTMLVideoElement) => {
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
      await player.applyEffect(new Effect(blur));
      await player.play();

      const audio = this.localStream.getAudioTracks()[0];
      const video = webar.getVideoTrack();

      this.localStream = new MediaStream([audio, video]);

      // eslint-disable-next-line no-param-reassign
      ref.srcObject = new MediaStream([audio, video]);

      await this.connection.getSenders()[1].replaceTrack(video);
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

  add = async (id: string) => {
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
