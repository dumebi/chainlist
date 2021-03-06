module.exports = {
     // See <http://truffleframework.com/docs/advanced/configuration>
     // to customize your Truffle configuration!
     networks: {
          ganache: {
               host: "localhost",
               port: 7545,
               network_id: "*" // Match any network id
          },
          comflo_network: {
               host: "localhost",
               port: 8545,
               network_id: "4224",
               gas: 4612388
          },
          comflo_server: {
               host: "159.89.119.189",
               port: 8545,
               network_id: "*",
               gas: 4612388
          }
     }
};
