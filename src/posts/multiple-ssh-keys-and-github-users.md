---
title: Multiple SSH keys and Github users
date: 2017-07-22
layout: post.html
---
Git is a great tool. I've been using SVN and Mercurial but for me Git hit the
spot. There are times I'm sitting comfortable in chair git pulling or git
pushing feeling the flow and everything is working as expected. But sometimes
I want to change git account to another - private one and there is the hitch.

## Option 1

I can set global config for my private account

```bash
git config --global user.name "Your Name Here"
git config --global user.email your@email.com
```

And I can specify individual user.name and user.email to use in specific repo.

```bash
git config user.name "Your Name Here"
git config user.email your@email.com
```

But I don't want write that every time I clone something as that user. It works
over https but what about ssh? I want to use my keys for the auth process.

## Option 2

I can make ssh config to handle it for me. First of all I need to create or edit
~/.ssh/config and configure two or more hosts in there.

```
# Personal Github
Host github-cringedcoder
HostName github.com
User cringedcoder
IdentityFile ~/.ssh/id_rsa_cringedcoder

# Work
Host github.com
HostName github.com
User git
IdentityFile ~/.ssh/id_rsa
```
