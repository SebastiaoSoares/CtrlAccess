;(function (win, doc) {
    'use strict'

    var ConfirmModal = {
        _modal: null,
        _confirmBtn: null,
        _cancelBtn: null,
        _currentId: null,
        _actions: {},

        init: function (options) {
        // options.actions: { buttonId: function }
        this._actions = options && options.actions ? options.actions : {
            emergencyAction: funcao,
        }
        this._ensureModal()
        this._bindTriggers()
        },

        _ensureModal: function () {
        // create modal markup if not present
        if (this._modal) return

        var modal = doc.createElement('div')
        modal.id = 'confirm-modal'
        modal.style.position = 'fixed'
        modal.style.left = 0
        modal.style.top = 0
        modal.style.right = 0
        modal.style.bottom = 0
        modal.style.display = 'none'
        modal.style.alignItems = 'center'
        modal.style.justifyContent = 'center'
        modal.style.background = 'rgba(0,0,0,0.4)'
        modal.innerHTML =
            '<div style="background:#fff;padding:18px;border-radius:6px;min-width:280px;max-width:90%;text-align:center">' +
            '<p id="confirm-modal-text">Confirma a ação?</p>' +
            '<div style="margin-top:12px;display:flex;gap:8px;justify-content:center">' +
            '<button id="confirm-modal-cancel" type="button">Cancelar</button>' +
            '<button id="confirm-modal-confirm" type="button">Confirmar</button>' +
            '</div></div>'

        doc.body.appendChild(modal)
        this._modal = modal
        this._confirmBtn = doc.getElementById('confirm-modal-confirm')
        this._cancelBtn = doc.getElementById('confirm-modal-cancel')

        var self = this
        this._confirmBtn.addEventListener('click', function () {
            self._onConfirm()
        })
        this._cancelBtn.addEventListener('click', function () {
            self.hide()
        })
        },

        _bindTriggers: function () {
        var self = this
        // any element with data-confirm attribute will trigger modal
        doc.addEventListener('click', function (e) {
            var t = e.target
            if (!t) return
            // walk up to find element with data-confirm
            while (t && t !== doc.body) {
            if (t.hasAttribute && t.hasAttribute('data-confirm')) {
                e.preventDefault()
                self._currentId = t.id || t.getAttribute('id') || null
                var text = t.getAttribute('data-confirm-text') || 'Confirma a ação?'
                var txtEl = doc.getElementById('confirm-modal-text')
                if (txtEl) txtEl.textContent = text
                self.show()
                return
            }
            t = t.parentNode
            }
        })
        },

        show: function () {
        if (!this._modal) this._ensureModal()
        this._modal.style.display = 'flex'
        },

        hide: function () {
        if (!this._modal) return
        this._modal.style.display = 'none'
        this._currentId = null
        },

        _onConfirm: function () {
        var id = this._currentId
        this.hide()
        if (!id) return
        // call mapped action if exists
        if (this._actions && typeof this._actions[id] === 'function') {
            try {
            this._actions[id].call(null, id)
            } catch (err) {
            console.error(err)
            }
            return
        }
        // otherwise dispatch event
        var ev = new CustomEvent('confirm:action', { detail: { id: id } })
        doc.dispatchEvent(ev)
        }
    }

    // expose
    win.ConfirmModal = ConfirmModal
})(window, document)
