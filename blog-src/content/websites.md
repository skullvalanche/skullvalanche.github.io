+++
title = "Websites are Easy, kinda"
date = 2025-06-19
+++

For the record, this blog is hosted on Github, though that's actually counter to the point of this post.

If you only take away one thing from this post, it's this: at it's very basic level, websites are just files sitting on a computer.

This will be "a long walk", but bear with me, since I think understanding the basics of how the web works takes out a lot of the mystery. Let's build things up from a bare minimum.

## It's just text files

Websites are just text files. Like, if you open up Notepad or Textedit on your computer and type in some text like "hello world" and then save it as a file named `hello.html` that is a webpage. You could open it with a web browser, and it'll work just fine.

Granted, that's a quite boring webpage, since it contains no images, or links, or anything useful, but it does meet the minimum criteria for being a webpage. Also, it's not on a _server_ yet, so you'd be the only one able to view that webpage (we'll get to that in a bit).

HyperText Markup Language (HTML) is just _special_ text that your browser interprets as instructions for how to display the text.

If you open up your `index.html` file again and modify it to read `<h1>Hello World!</h1>`, save, then re-open it in your browser you'll notice the text is suddenly much bigger. `<h1>` and `</h1>` are the _HTML tags_ which instructs the browser to make the text size "Header size 1". There are many HTML tags, and you can do a lot of cool and complicated things with HTML, but that's well beyond the scope of this post. Check out [this tutorial](https://www.w3schools.com/html/) if you want a deep dive.

Create a folder on your computer named `website` then create sub-folder named `hello` and put the `index.html` file in there. 
Make a second sub-folder inside `website` named `goodbye` and put another `index.html` file in there.

You should have a folder structure that looks like this:

```
website
├── goodbye
│   └── index.html
└── hello
    └── index.html
```

Ever notice when you go to a website like `http://some.website/hello/` you get one page, and if you go to `http://some.website/goodbye/`you get another page?

In the simplest scenario, you're just navigating folders of files on a web server.

## Web servers

Okay, so you have some HTML text files and you want to make them available to the rest of the world. You're gonna need a host machine running a web server.

The term "server" can be a bit overloaded, so to avoid confusion, I'll call the computer the _host_ and the application the _web server_.

Any computer can host a website, as long as that computer is able to run a web server application. Even the tiny computer chip inside a wifi lightbulb can host a website. (Some do!)

A web server app is a program which "listens" for web requests, and when it receives one (from a browser) it responds by sending the file(s) specified in the request.

(Note: I don't recommend doing the following for public websites, but it's good for learning purposes.)

Let's say you want to use your computer as the host for a web server. You have your `website` folder with its sub-folders and HTML files inside, and you want to make it available at an HTTP web address.

You will need a web server app installed on your computer. There are many web servers out there: [IIS](https://www.iis.net/), [Apache](https://httpd.apache.org/), [Nginx](https://nginx.org/), and [Caddy](https://caddyserver.com/) are but a few. Choosing one will depend on what operating system you're using and some other factors which are beyond the scope of this post. Just know that most big web hosting services are running Linux, and often those hosts will have a web server app pre-installed for convenience.

