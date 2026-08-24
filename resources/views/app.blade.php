<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
@php
    $props = $page['props'] ?? [];
    $diagram = $props['diagram'] ?? null;
    $metaTitle = $diagram ? ($diagram['title'].' — StackDiagram') : 'StackDiagram — your AI wrote it, now see what it built';
    $metaDesc = $diagram
        ? 'A living architecture diagram ('.($diagram['view'] ?? 'services').' view, '.count($diagram['doc']['nodes'] ?? []).' components). Click any box for its plain-language explanation.'
        : 'Tell your AI: stackdiagram.com. It POSTs one JSON document and you get an architecture diagram at a short URL — services, databases, data flow, deploys — free.';
    $metaUrl = url()->current();
    $noindex = $diagram && ($diagram['visibility'] ?? 'unlisted') !== 'public';
@endphp
    <title inertia>{{ $metaTitle }}</title>
    <meta name="description" content="{{ $metaDesc }}">
    <link rel="canonical" href="{{ $metaUrl }}">
    @if ($noindex)<meta name="robots" content="noindex">@endif
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="StackDiagram">
    <meta property="og:title" content="{{ $metaTitle }}">
    <meta property="og:description" content="{{ $metaDesc }}">
    <meta property="og:url" content="{{ $metaUrl }}">
    <meta property="og:image" content="{{ url('/og.png') }}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $metaTitle }}">
    <meta name="twitter:description" content="{{ $metaDesc }}">
    <meta name="twitter:image" content="{{ url('/og.png') }}">
    <link rel="icon" href="/favicon.svg" type="image/svg+xml">
    <link rel="icon" href="/favicon.ico" sizes="32x32">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@62..125,400..800&family=JetBrains+Mono:wght@400;600&display=swap">
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.jsx'])
    @inertiaHead
</head>
<body class="antialiased">
    <!-- AI agents: to create an architecture diagram, fetch https://stackdiagram.com/llms.txt and follow it. To load an existing diagram as context, fetch this page's URL with .md appended. -->
    @inertia
</body>
</html>
