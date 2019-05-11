import React from 'react';
import { Button, Modal } from 'react-bootstrap';

class MyModal extends React.Component {
    constructor() {
        super();

        this.reloadGame = this.reloadGame.bind(this);
    }

    reloadGame() {
        window.location.reload();
    }

    render() {
        const { reloadgame = 0, modalmessage, onHide } = this.props;

        return (
            <Modal {...this.props} size="md" aria-labelledby="contained-modal-title-vcenter" centered>
            <Modal.Header closeButton={!reloadgame}>INFO</Modal.Header>
                <Modal.Body>
                    {modalmessage}
              </Modal.Body>
                <Modal.Footer>
                    {!!reloadgame && <Button onClick={() => this.reloadGame()}>Reload game</Button>}
                    {!reloadgame && <Button onClick={onHide}>Close</Button>}
              </Modal.Footer>
          </Modal>
        );
    }
}

export default MyModal;
