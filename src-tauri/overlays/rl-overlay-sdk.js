/*!
 * RL Overlay SDK v1.0.0
 * Minimal JavaScript SDK for building custom OBS overlays that connect to
 * the Rocket League Stats Companion overlay server (ws://127.0.0.1:9528/ws).
 *
 * Dependency-free, vanilla JS (ES5 compatible), ~5 KB gzipped.
 *
 * Usage:
 *   <script src="http://127.0.0.1:9528/sdk/rl-overlay.js"></script>
 *   <script>
 *     var overlay = RLOverlay.connect();
 *     overlay.on('state', function(s) { console.log(s.scoreBlue); });
 *   </script>
 *
 * @license MIT
 */
(function () {
  'use strict';

  // =========================================================================
  //  Event emitter helpers
  // =========================================================================

  function createEmitter() {
    var listeners = {};

    return {
      on: function (event, fn) {
        if (typeof fn !== 'function') { return; }
        if (!listeners[event]) { listeners[event] = []; }
        listeners[event].push(fn);
      },

      off: function (event, fn) {
        var stack = listeners[event];
        if (!stack) { return; }
        if (fn) {
          for (var i = stack.length - 1; i >= 0; i--) {
            if (stack[i] === fn) { stack.splice(i, 1); }
          }
        } else {
          delete listeners[event];
        }
      },

      emit: function (event, data) {
        var stack = listeners[event];
        if (!stack) { return; }
        for (var i = 0; i < stack.length; i++) {
          try { stack[i](data); } catch (e) { /* silent */ }
        }
      },

      removeAll: function () {
        listeners = {};
      }
    };
  }

  // =========================================================================
  //  Connection factory (private)
  // =========================================================================

  function createConnection(opts) {
    opts = opts || {};

    var host = opts.host || '127.0.0.1';
    var port = opts.port || (location.port || 9528);
    var reconnectDelay = (typeof opts.reconnectDelay === 'number')
      ? opts.reconnectDelay
      : 2000;
    var url = 'ws://' + host + ':' + port + '/ws';

    var emitter = createEmitter();
    var ws = null;
    var connected = false;
    var manualClose = false;
    var lastState = null;
    var reconnectTimer = null;

    // -- Internal helpers ---------------------------------------------------

    function connect() {
      // Prevent overlapping connections
      if (ws && (ws.readyState === WebSocket.CONNECTING ||
                 ws.readyState === WebSocket.OPEN)) {
        return;
      }
      manualClose = false;

      try {
        ws = new WebSocket(url);
      } catch (e) {
        scheduleReconnect();
        return;
      }

      ws.onopen = function () {
        connected = true;
        emitter.emit('connected');
      };

      ws.onmessage = function (msg) {
        var payload;
        try { payload = JSON.parse(msg.data); }
        catch (e) { return; } // ignore malformed JSON

        var type = payload.type;
        var data = payload.data;

        switch (type) {
          case 'connected':
            connected = true;
            emitter.emit('connected');
            break;
          case 'state':
            lastState = data;
            emitter.emit('state', data);
            break;
          case 'goal':
            emitter.emit('goal', data);
            break;
          case 'statfeed':
            emitter.emit('statfeed', data);
            break;
          case 'ball_hit':
            emitter.emit('ball_hit');
            break;
          case 'clock':
            emitter.emit('clock', data);
            break;
          case 'match_started':
            emitter.emit('match_started');
            break;
          case 'match_ended':
            emitter.emit('match_ended', data);
            break;
          case 'match_paused':
            emitter.emit('match_paused');
            break;
          case 'match_unpaused':
            emitter.emit('match_unpaused');
            break;
          case 'replay_start':
            emitter.emit('replay_start');
            break;
          case 'replay_end':
            emitter.emit('replay_end');
            break;
          default:
            // Unknown event types are silently ignored
            break;
        }
      };

      ws.onclose = function () {
        connected = false;
        emitter.emit('disconnected');
        if (!manualClose) { scheduleReconnect(); }
      };

      ws.onerror = function () {
        connected = false;
        // onclose fires afterwards, reconnect logic lives there
      };
    }

    function scheduleReconnect() {
      if (reconnectTimer || manualClose) { return; }
      reconnectTimer = setTimeout(function () {
        reconnectTimer = null;
        connect();
      }, reconnectDelay);
    }

    function cancelReconnect() {
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    }

    // -- Public API ---------------------------------------------------------

    var api = {};

    /**
     * Register an event listener.
     * @param {string}   event  Event name (see supported events list)
     * @param {Function} fn     Callback
     */
    api.on = function (event, fn) {
      emitter.on(event, fn);
    };

    /**
     * Remove an event listener. Omit `fn` to remove all for an event.
     * @param {string}   event
     * @param {Function} [fn]
     */
    api.off = function (event, fn) {
      emitter.off(event, fn);
    };

    /**
     * Return the last cached LiveMatchState, or null.
     * @returns {Object|null}
     */
    api.getState = function () {
      return lastState;
    };

    /**
     * Whether the WebSocket is currently connected.
     * @returns {boolean}
     */
    api.isConnected = function () {
      return connected;
    };

    /**
     * Explicitly disconnect. No auto-reconnect after this call.
     */
    api.disconnect = function () {
      manualClose = true;
      cancelReconnect();
      if (ws) {
        ws.close();
        ws = null;
      }
      connected = false;
      lastState = null;
      emitter.removeAll();
    };

    /**
     * Blue-team players from cached state, sorted by score desc.
     * @returns {Array}
     */
    api.getBluePlayers = function () {
      if (!lastState || !lastState.players) { return []; }
      return lastState.players
        .filter(function (p) { return p.team === 0; })
        .sort(function (a, b) { return b.score - a.score; });
    };

    /**
     * Orange-team players from cached state, sorted by score desc.
     * @returns {Array}
     */
    api.getOrangePlayers = function () {
      if (!lastState || !lastState.players) { return []; }
      return lastState.players
        .filter(function (p) { return p.team === 1; })
        .sort(function (a, b) { return b.score - a.score; });
    };

    /**
     * Format seconds into MM:SS string (e.g. 300 → "5:00", 5 → "0:05").
     * @param {number} seconds
     * @returns {string}
     */
    api.formatTime = function (seconds) {
      if (typeof seconds !== 'number' || seconds < 0) { return '0:00'; }
      var mins = Math.floor(seconds / 60);
      var secs = Math.floor(seconds % 60);
      return mins + ':' + (secs < 10 ? '0' + secs : secs);
    };

    // -- Auto-connect on creation -------------------------------------------
    connect();

    return api;
  }

  // =========================================================================
  //  Expose RLOverlay on window
  // =========================================================================

  window.RLOverlay = {
    /**
     * Create and connect a new overlay instance.
     * @param {Object} [opts]            Configuration
     * @param {string} [opts.host]       Server host (default '127.0.0.1')
     * @param {number} [opts.port]       Server port (default 9528)
     * @param {number} [opts.reconnectDelay]  ms between reconnect attempts (default 2000)
     * @returns {Object} Connection instance with .on(), .off(), .getState(), etc.
     */
    connect: function (opts) {
      return createConnection(opts);
    }
  };

})();
