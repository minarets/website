# Minarets
A community website for Dave Matthews Band fans to interact and listen to fan taped show archives.

## Sponsorship
This project is a hobby project by Jim Geurts (@jgeurts). The website is created in my spare
time and I do not make any money from it. If you want to help support development for the website,
please consider sponsoring me!

<a href="https://github.com/sponsors/jgeurts" class="btn btn-block" role="button">:heart: &nbsp; Sponsor</a>

## Contributing
If you are interested in contributing to this project, please submit a PR! This project is built
on [Next.js](https://nextjs.org) and hosted by [Vercel](https://vercel.com).


### Running the site locally

1. Create an account using an email address at: https://minarets.io. You'll use the email address to login during development.

2. Install redis:

```zsh
brew update
brew install redis
brew services start redis
```

3. Install dependencies:
```zsh
yarn install
```

4. Run a local dev smtp server. For example:
```zsh
npx maildev
```

5. Create .env.local at the root of the project with the following content
```zsh
EMAIL_SERVER_HOST=localhost
EMAIL_SERVER_PORT=1025
EMAIL_FROM=dev@minarets.io

MINARETS_API_URL=https://api.minarets.io
MINARETS_API_KEY=ca6dd411-69f2-433d-95b4-8609efae5660
MINARETS_API_TOKEN=xs6sg5nezndzpk6xjfwrg4qgcyncznhz

REDIS_URL=redis://localhost:6379

AUTH_SECRET=NotASecret
NEXTAUTH_URL=http://localhost:3000/

NODE_TLS_REJECT_UNAUTHORIZED='0'

```

6. Start the development server:

```zsh
yarn dev
```

7. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

NOTE: When logging in, you can get the login link from your local dev smtp server by visiting http://localhost:1080.

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

<a href="https://vercel.com?utm_source=minarets&utm_campaign=oss"><img src="public/powered-by-vercel.svg" alt="Powered by Vercel"></a>
