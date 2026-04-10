/*
 * Canonical service worker entry file.
 * We keep core logic in sw.js and load it from here so registration can target
 * /service-worker.js while preserving backwards compatibility.
 */
importScripts('/sw.js');
