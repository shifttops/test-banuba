import {
  FC, useRef, useCallback, useState,
} from 'react';
import { observer } from 'mobx-react';
import { toast, ToastContainer } from 'react-toastify';
// @ts-ignore
import styles from './room.module.scss';
import { CameraIcon, MicrophoneIcon, ShareIcon } from '../../assets/icons/icons';
import RoomStore from '../../store/RoomStore';
import Button from '../../components/button';
import 'react-toastify/dist/ReactToastify.css';
// @ts-ignore
import poster from '../../assets/images/poster.jpg';

const Room: FC = observer(() => {
  const localStreamRef = useRef<null | HTMLVideoElement>(null);

  const remoteStreamRef = useRef<null | HTMLVideoElement>(null);

  const [isAudioActive, setIsAudioActive] = useState<boolean>(false);
  const [isVideoActive, setIsVideoActive] = useState<boolean>(false);
  const [id, setId] = useState<string>('');

  const {
    reloadTrack, setStream, createOffer, add, addBlur,
  } = RoomStore;

  const getMedia = async () => {
    try {
      const stream = await setStream.call(RoomStore, await navigator.mediaDevices
        .getUserMedia({ video: true, audio: true }), 'local');

      const remote = await setStream.call(RoomStore, new MediaStream(), 'remote');

      if (localStreamRef.current) {
        localStreamRef.current.srcObject = stream;

        setIsAudioActive(true);
        setIsVideoActive(true);
      }

      if (remoteStreamRef.current) remoteStreamRef.current.srcObject = remote;
    } catch (err: any) {
      toast.error(err.message, {
        theme: 'dark',
      });
    }
  };

  const handleVideoClick = useCallback(async (): Promise<void> => {
    if (localStreamRef.current?.srcObject) setIsVideoActive(reloadTrack.call(RoomStore, 'video'));
    else await getMedia();
  }, []);

  const handleAudioClick = useCallback((): void => setIsAudioActive(reloadTrack.call(RoomStore, 'audio')), []);

  const invite = async () => {
    const roomId = await createOffer.bind(RoomStore)();
    setId(roomId);
    await navigator.clipboard.writeText(roomId);

    toast.info('Room Id copied to the clipboard!', {
      theme: 'dark',
    });
  };

  const accept = async () => {
    await add.call(RoomStore, id);

    setTimeout(() => {
      toast.success('Connected!', {
        theme: 'dark',
      });
    }, 3000);
  };

  const blur = () => addBlur.call(RoomStore, localStreamRef.current as HTMLVideoElement);

  return (
    <div className={styles.room}>
      <div className={styles.videos}>
        <div className={styles.video}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={localStreamRef} poster={poster} autoPlay muted />
          {localStreamRef.current?.srcObject ? <span>You</span> : null}
        </div>
        <div className={styles.video}>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video ref={remoteStreamRef} placeholder={poster} autoPlay />
          {remoteStreamRef.current?.srcObject
            ? <span>Guest</span>
            : null}
        </div>
      </div>
      <div className={styles.buttons}>
        {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
        <Button
          /* eslint-disable-next-line max-len */
          isEnabled={!!(isVideoActive && localStreamRef.current?.srcObject)}
          handleClick={handleVideoClick}
          Icon={CameraIcon}
        />
        <Button
          isEnabled={!!(isAudioActive && localStreamRef.current?.srcObject)}
          handleClick={handleAudioClick}
          Icon={MicrophoneIcon}
        />
        <Button
          isEnabled
          handleClick={blur}
          text="Blur"
        />
        {localStreamRef.current?.srcObject ? (
          <Button
            isEnabled
            handleClick={invite}
            Icon={ShareIcon}
          />
        ) : null}
      </div>
      {localStreamRef.current?.srcObject ? (
        <div className={styles.actions}>
          <input
            placeholder="Room id"
            className={styles.input}
            type="text"
            defaultValue={id}
            onChange={(e) => setId(e.target.value)}
          />
          <Button
            isEnabled
            handleClick={accept}
            text="Connect"
          />
        </div>
      ) : null}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
      />
    </div>
  );
});

export default Room;
