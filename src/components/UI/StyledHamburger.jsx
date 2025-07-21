import React, { useState, useEffect } from "react";
import styled from "styled-components";

// STYLED HAMBURGER COMPONENT
export default function StyledHamburger({ onContactClick, closeMenu }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isTransloadingOpen, setIsTransloadingOpen] = useState(false);
  const [isStuffingOpen, setIsStuffingOpen] = useState(false);
  const [isStrippingOpen, setIsStrippingOpen] = useState(false);
  const [isTransfersOpen, setIsTransfersOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileTranslate, setMobileTranslate] = useState(0); // 0=center, -1=left, 1=right

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setIsTransloadingOpen(false);
      setIsStuffingOpen(false);
      setIsStrippingOpen(false);
      setIsTransfersOpen(false);
      setMobileTranslate(0);
    }
  };

  const handleTransloadingClick = (e) => {
    e.preventDefault();
    setIsTransloadingOpen((prev) => !prev);
    if (window.innerWidth < 600) {
      setMobileTranslate((prev) => (prev === 1 ? 0 : 1));
    }
  };

  const handleStuffingClick = (e) => {
    e.preventDefault();
    setIsStuffingOpen((prev) => !prev);
  };

  const handleStrippingClick = (e) => {
    e.preventDefault();
    setIsStrippingOpen((prev) => !prev);
  };

  const handleTransfersClick = (e) => {
    e.preventDefault();
    setIsTransfersOpen((prev) => !prev);
    if (window.innerWidth < 600) {
      setMobileTranslate((prev) => (prev === -1 ? 0 : -1));
    }
  };

  // Reset translation on mobile
  const handleResetMobile = () => {
    setMobileTranslate(0);
    setIsTransloadingOpen(false);
    setIsTransfersOpen(false);
  };

  return (
    <StyledWrapper
      className={isOpen ? "open" : ""}
      $mobiletranslate={mobileTranslate}
    >
      <nav className="menu">
        <input
          type="checkbox"
          id="menu-open"
          className="menu-open"
          checked={isOpen}
          onChange={handleToggle}
        />
        <label className="menu-open-button" htmlFor="menu-open">
          START NEW PROJECT
        </label>

        {/*
        // Show reset button on mobile when translated
        {mobileTranslate !== 0 && (
          <button
            className="mobile-reset-btn"
            onClick={handleResetMobile}
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
          >
            Back
          </button>
        )}
        */}

        <div className="menu-item transfers-wrapper item9">
          <a href="#" className="transfers-main" onClick={handleTransfersClick}>
            Transfers
          </a>
          {isTransfersOpen && (
            <>
              <a
                href="/services/stripping-restuffing"
                className="transfers-sub transfers-sub-top"
              >
                Stripping & Restuffing
              </a>
              <a
                href="/services/transshipment-C2C"
                className="transfers-sub transfers-sub-bottom"
              >
                C2C Transfer
              </a>
            </>
          )}
        </div>
        <div className="menu-item item2 stripping-wrapper">
          <a href="#" className="stripping-main" onClick={handleStrippingClick}>
            Stripping
          </a>
          {isStrippingOpen && (
            <a href="/services/stripping/" className="stripping-sub">
              Container Storage
            </a>
          )}
        </div>
        <div className="menu-item item3 stuffing-wrapper">
          <a href="#" className="stuffing-main" onClick={handleStuffingClick}>
            Stuffing
          </a>
          {isStuffingOpen && (
            <a href="/services/stuffing/" className="stuffing-sub">
              Storage Container
            </a>
          )}
        </div>
        <div className="menu-item item4 transloading-wrapper">
          <a
            href="#"
            className="transloading-main"
            onClick={handleTransloadingClick}
          >
            Transloading
          </a>
          {isTransloadingOpen && (
            <>
              <a
                href="/services/transloading/container-truck"
                className="transloading-sub sub1"
              >
                Container Truck
              </a>
              <a
                href="/services/transloading/truck-container"
                className="transloading-sub sub2"
              >
                Truck Container
              </a>
            </>
          )}
        </div>
        <a
          href="/services/lashing"
          rel="noopener noreferrer"
          className="menu-item item5"
        >
          Lashing
        </a>
        <a
          href="/services/vessel-barge/"
          rel="noopener noreferrer"
          className="menu-item item6"
        >
          Vessel/Barge
        </a>
        <a href="/services/stripping" className="menu-item item7">
          Stripping
        </a>
        <a href="/services/stuffing" className="menu-item item8">
          Stuffing
        </a>
      </nav>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .menu {
    position: relative;
    width: 300px;
    height: 300px;
    margin: 100px auto;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  .menu-open-button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: #319795;
    color: white;
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    transition: background 0.3s;
  }
  .menu-open-button:hover {
    background: #2c7a7b;
  }

  .menu-item {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #319795;
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    opacity: 0;
    pointer-events: none;
    transform: translate(-50%, -50%) scale(0.5);
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  }

  &.open .menu-item {
    opacity: 1;
    pointer-events: auto;
    transform: translate(-50%, -50%) scale(1);
  }

  &.open .item6 {
    transform: translate(-50%, -50%) rotate(0deg) translate(120px) rotate(0deg);
  }
  &.open .item2 {
    transform: translate(-50%, -50%) rotate(60deg) translate(120px)
      rotate(-60deg);
  }
  &.open .item3 {
    transform: translate(-50%, -50%) rotate(120deg) translate(120px)
      rotate(-120deg);
  }
  &.open .item4 {
    transform: translate(-50%, -50%) rotate(180deg) translate(120px)
      rotate(-180deg);
  }
  &.open .item5 {
    transform: translate(-50%, -50%) rotate(240deg) translate(120px)
      rotate(-240deg);
  }
  &.open .item6 {
    transform: translate(-50%, -50%) rotate(300deg) translate(120px)
      rotate(-300deg);
  }
  &.open .item9 {
    transform: translate(-50%, -50%) rotate(360deg) translate(120px)
      rotate(-360deg);
  }

  .menu-item:hover {
    background: #2c7a7b;
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.18);
  }

  .menu-open {
    display: none;
  }

  // SUBMENU STYLES FOR TRANSLOADING
  .transloading-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    box-shadow: none;
    pointer-events: none;
    z-index: 3;
  }
  .transloading-main {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #319795;
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    pointer-events: auto;
    z-index: 4;
    transition: background 0.3s;
    position: relative;
  }
  .transloading-main:hover {
    background: #2c7a7b;
  }
  .transloading-sub {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #38b2ac;
    color: white;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
    opacity: 0;
    pointer-events: none;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    z-index: 3;
    cursor: pointer;
    pointer-events: auto;
  }
  .transloading-wrapper .transloading-sub.sub1 {
    left: -114px;
    top: -40px;
  }
  .transloading-wrapper .transloading-sub.sub2 {
    left: -110px;
    top: 70px;
  }
  .transloading-wrapper .transloading-sub {
    opacity: 1;
    pointer-events: auto;
  }
  // SHOW SUBMENU WHEN OPEN
  .transloading-wrapper:not(:has(.transloading-sub)) .transloading-sub {
    opacity: 0;
    pointer-events: none;
  }

  // SUBMENU STYLES FOR STUFFING
  .stuffing-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    box-shadow: none;
    pointer-events: none;
    z-index: 3;
  }
  .stuffing-main {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #319795;
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    pointer-events: auto;
    z-index: 4;
    transition: background 0.3s;
    position: relative;
  }
  .stuffing-main:hover {
    background: #2c7a7b;
  }
  .stuffing-sub {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #38b2ac;
    color: white;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
    opacity: 1;
    pointer-events: auto;
    left: -90px;
    top: 70px;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    z-index: 3;
    cursor: pointer;
    pointer-events: auto;
  }

  // SUBMENU STYLES FOR STRIPPING
  .stripping-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    box-shadow: none;
    pointer-events: none;
    z-index: 3;
  }
  .stripping-main {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #319795;
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    pointer-events: auto;
    z-index: 4;
    transition: background 0.3s;
    position: relative;
  }
  .stripping-main:hover {
    background: #2c7a7b;
  }
  .stripping-sub {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #38b2ac;
    color: white;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
    opacity: 1;
    pointer-events: auto;
    left: 96px;
    top: 70px;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    z-index: 3;
    cursor: pointer;
    pointer-events: auto;
  }

  .transloading-sub,
  .stuffing-sub,
  .stripping-sub {
    cursor: pointer;
    pointer-events: auto;
  }

  // SUBMENU STYLES FOR TRANSFERS
  .transfers-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    box-shadow: none;
    pointer-events: none;
    z-index: 3;
  }
  .transfers-main {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    background: #319795;
    color: white;
    font-weight: bold;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
    cursor: pointer;
    pointer-events: auto;
    z-index: 4;
    transition: background 0.3s;
    position: relative;
  }
  .transfers-main:hover {
    background: #2c7a7b;
  }
  .transfers-sub {
    position: absolute;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: #38b2ac;
    color: white;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
    opacity: 1;
    pointer-events: auto;
    left: 90px;
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    z-index: 3;
    cursor: pointer;
    pointer-events: auto;
  }
  .transfers-sub-top {
    top: -42px;
    left: 120px;
  }
  .transfers-sub-bottom {
    top: 70px;
    left: 120px;
  }

  /* MOBILE TRANSLATION */
  @media (max-width: 600px) {
    .menu {
      width: 100vw;
      margin: 40px 0 0 0;
      /* TranslateX based on state: right for transloading, left for transfers */
      transform: ${({ $mobiletranslate }) =>
        $mobiletranslate === 1
          ? "translateX(80px)" // shift right
          : $mobiletranslate === -1
          ? "translateX(-80px)" // shift left
          : "translateX(0)"};
    }
    .mobile-reset-btn {
      background: #319795;
      color: #fff;
      border: none;
      border-radius: 8px;
      padding: 6px 16px;
      font-size: 15px;
      font-weight: bold;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.13);
      cursor: pointer;
    }
    .mobile-reset-btn:active {
      background: #2c7a7b;
    }
  }
`;
