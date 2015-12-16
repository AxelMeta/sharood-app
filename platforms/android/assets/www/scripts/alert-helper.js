define([], function () {
    return {
        overlay: null,
        currentAlert: null,

        alert: function (selector) {
            if (!this.overlay) {
                var overlay = document.createElement('div');
                overlay.className = 'material-alert-overlay';
                document.body.appendChild(overlay);
                this.overlay = overlay;
                this._addCloseListenerToOverlay();
            }

            this.currentAlert = document.querySelector(selector);
            if (!this.currentAlert) {
                console.error('Alert element does not exists');
                return;
            }
            this.onClose = this._onClose.bind(this);

            this._attachCloseEvents();

            this.overlay.classList.add('open');
            this.currentAlert.classList.add('open');
            this._dispatchEvent('ma-opened');
        },

        _onClose: function (evt) {
            if (evt.target.getAttribute('type') !== 'reset') {
                evt.preventDefault();
            }
            evt.target.removeEventListener('click', this.onClose);
            if (this.currentAlert) {
                this._close();
            }
        },

        close: function (selector) {
            var alert = document.querySelector(selector);
            if (!alert.classList.contains('open') || alert !== this.currentAlert) {
                return;
            }

            this._close();
        },

        _close: function () {
            this._removeCloseEvents();
            this.currentAlert.classList.remove('open');
            this.overlay.classList.remove('open');
            this._dispatchEvent('ma-closed');
        },

        _addCloseListenerToOverlay: function () {
            this.overlay.addEventListener('click', function (evt) {
                evt.preventDefault();
                if (this.currentAlert) {
                    this._close();
                }
            }.bind(this));
        },

        _dispatchEvent: function (evtType) {
            var event;
            // Supports IE
            if (typeof CustomEvent !== 'function') {
                event = document.createEvent('Event');
                event.initEvent(evtType, true, true);
            } else {
                event = new CustomEvent(evtType);
            }

            document.dispatchEvent(event);
        },

        _attachCloseEvents: function () {
            var elems = document.querySelectorAll('[data-close="#' + this.currentAlert.id + '"]');

            Array.prototype.forEach.call(elems, function (elm) {
                elm.addEventListener('click', this.onClose);
            }.bind(this));
        },

        _removeCloseEvents: function () {
            var elems = document.querySelectorAll('[data-close="#' + this.currentAlert.id + '"]');

            Array.prototype.forEach.call(elems, function (elm) {
                elm.removeEventListener('click', this.onClose);
            }.bind(this));

            this.overlay.removeEventListener('click', this.onClose);
        },

        updateContent: function (alertSelector, newContent) {
            var alert = document.querySelector(alertSelector);
            if (typeof newContent !== 'object' || !alert) {
                return;
            }

            for (var key in newContent) {
                var element = alert.querySelector('[data-update="' + key + '"]');
                if (!element) {
                    continue;
                }

                element.setAttribute(key, newContent[key]);
            }
        }
    };
});