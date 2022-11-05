import Head from 'next/head';
import * as React from 'react';

import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import styles from '../../styles/Donate.module.scss';

export default function Page(): JSX.Element {
  const title = 'Donate';
  useDocumentTitle(title);

  return (
    <>
      <Head>
        <title>{`${title} · Minarets`}</title>
      </Head>

      <section className="card mb-3">
        <h4 className="card-header">Donation Information</h4>
        <div className="card-body">
          <p className="card-text">
            Thanks for your interest in donating to keep the site alive! This site exists to build and foster the community of fans of the Dave Matthews Band. Chat with others while reliving past
            shows!
          </p>
          <p className="card-text">Your donations and support help cover the costs associated with running the site. The costs come from running the web servers and bandwidth from streaming songs.</p>
          <p className="card-text">There are no ads on this website. Ads suck, they are a parasite of modern websites. I would rather cover all costs for this project by myself than introduce ads.</p>
          <p className="card-text">There is no obligation to donate. This site has always been and will always remain free to enjoy!</p>
          <p className="card-text">Thank you, please enjoy the site! If you have any questions or concerns, please don&#39;t hesitate to reach out to me!</p>
          <p className="card-text">
            &#8212; Jim Geurts <a href="mailto:jim@biacreations.com">jim@biacreations.com</a>
          </p>
        </div>
      </section>

      <section className="card mb-3">
        <h4 className="card-header">How To Donate</h4>
        <div className="card-body">
          <h5 className="card-title">Preferred donation method</h5>
          <iframe src="https://github.com/sponsors/jgeurts/button" title="Sponsor Jim" height="35" width="107" style={{ border: 0 }} />
        </div>
        <div className="card-body border-top">
          <h5 className="card-title">Other ways to donate</h5>
          <div className="d-flex flex-row py-2 pb-4">
            <div className="pe-4">
              <a href="https://www.patreon.com/jgeurts" className={`btn btn-success btn-sm ${styles.patron}`}>
                <svg viewBox="0 0 569 546" xmlns="http://www.w3.org/2000/svg">
                  <g>
                    <circle cx="362.589996" cy="204.589996" data-fill="1" id="Oval" r="204.589996" />
                    <rect data-fill="2" height="545.799988" id="Rectangle" width="100" x="0" y="0" />
                  </g>
                </svg>
                Become a patron
              </a>
            </div>
            <div>
              <a href="https://www.paypal.me/biacreations">
                <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" alt="PayPal" />
              </a>
              {/*
              // TODO: Need to hook up ipn
              <li className="list-group-item">
                <form name="_xclick" action="https://www.paypal.com/us/cgi-bin/webscr" method="post">
                  <input type="hidden" name="cmd" value="_donations" />
                  <input type="hidden" name="business" value="jim@biacreations.com" />
                  <input type="hidden" name="item_name" value="Minarets Donation" />
                  <input type="hidden" name="page_style" value="DMBStream" />
                  <input type="hidden" name="amount" value="" />
                  {session && <input type="hidden" name="custom" value={session.user.id} />}
                  <input type="hidden" name="return" value={`${process.env.VERCEL_URL}/donate/thanks`} />
                  <input type="hidden" name="cancel_return" value={`${process.env.VERCEL_URL}/donate/cancel`} />
                  <input type="hidden" name="notify_url" value={`${process.env.VERCEL_URL}/api/minarets/paypal-ipn`} />
                  <input type="hidden" name="no_shipping" value="0" />
                  <input type="hidden" name="no_note" value="1" />

                  <input type="hidden" name="rm" value="1" />
                  <input type="hidden" name="cbt" value="Return to Minarets" />
                  <input type="hidden" name="tax" value="0" />

                  <input type="image" src="//www.paypal.com/en_US/i/btn/btn_donate_LG.gif" style={{ border: 0 }} name="submit" alt="Donate" />
                </form>
              </li>*/}
            </div>
          </div>
          <p className="card-text">
            If you would like to donate and the above methods do not work for you, please <a href="mailto:jim@biacreations.com">reach out</a> and we can figure something else out.
          </p>
        </div>
      </section>
    </>
  );
}
